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
    "payment.status" : { $ne : PAYMENT_STATUS.PENDING}
  };

  // if (query.search) {
  //   filter.$or = [
  //     { orderId: { $regex: query.search, $options: "i" } },
  //     { "user.name": { $regex: query.search, $options: "i" } },
  //   ];
  // }
  // Add date range filter if provided
  if (query.startDate || query.endDate) {
    filter.placedOn = {};

    if (query.startDate) {
      // Start of the day
      filter.placedOn.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      // End of the day
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.placedOn.$lte = endDate;
    }
  }

  if (query.status) {
    filter.status = query.status;
  }

  const orders = await Order.find(
    filter,
    orderFilter,
    paginationOptions(query.page, query.limit),
  );

  const allOrders = await Order.find({}, orderFilter);

  const completedOrders = allOrders.filter(
    (order) => order.status === ORDER_STATUS.DELIVERED,
  );
  const totalRevenue = completedOrders.reduce(
    (acc, order) => order.grandTotalAmount + acc,
    0,
  );

  return {
    orders,
    orderCount: orders.length,
    totalOrders: allOrders.length,
    completedOrders: completedOrders.length,
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
