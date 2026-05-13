import {
  STATUS_CODES,
  ERROR_MESSAGES,
  TOKEN_TYPE,
  USER_TYPE,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../../config/appConstants.js";
import { Order } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import { orderFilter } from "../../utils/orderUtils.js";
import { paginationOptions } from "../../utils/universalFunctions.js";
export const getOrders = async (query) => {
  let filter = {
    "payment.status": { $ne: PAYMENT_STATUS.PENDING },
  };

  if (query.startDate || query.endDate) {
    filter.placedOn = {};
    if (query.startDate) filter.placedOn.$gte = new Date(query.startDate);
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.placedOn.$lte = endDate;
    }
  }

  if (query.status) filter.status = query.status;

  // Run independent queries in parallel
  const [orders, orderCount, stats] = await Promise.all([
    // Paginated filtered orders
    Order.find(filter, orderFilter, paginationOptions(query.page, query.limit)),

    // Count of filtered orders
    Order.countDocuments(filter),

    // Aggregate total + completed + revenue in ONE db call
    Order.aggregate([
      { $match: { "payment.status": { $ne: PAYMENT_STATUS.PENDING } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", ORDER_STATUS.DELIVERED] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", ORDER_STATUS.DELIVERED] },
                "$grandTotalAmount",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const { totalOrders, completedOrders, totalRevenue } = stats[0] ?? {
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  };

  return {
    orders,
    orderCount,
    totalOrders,
    completedOrders,
    totalRevenue,
  };
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId, orderFilter);
  if (!order) {
    throw new OperationalError(
      STATUS_CODES.SUCCESS,
      ERROR_MESSAGES.NO_SUCH_ORDER,
    );
  }
  return order;
};

// export const getAllTransactions = async (query) => {
//   let filter = {};

// }
