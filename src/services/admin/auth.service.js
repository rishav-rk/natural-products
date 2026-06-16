import {
  ERROR_MESSAGES,
  PAYMENT_STATUS,
  STATUS_CODES,
  TOKEN_TYPE,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { Admin, User, Order, Product } from "../../models/index.js";
import {
  deletePreviousToken,
  generateAuthToken,
  generateForgotPasswordToken,
  logOutFromAllAdmin,
  updateToken,
} from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";
import { formatUser, formatGraphData } from "../../utils/formatResponse.js";
import moment from "moment";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const login = async (loginData) => {
  const admin = await Admin.findOne({
    email: loginData.email,
  })
    .select("+password")
    .lean();

  if (!admin) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  if (!(await bcrypt.compare(loginData.password, admin.password))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const authToken = await generateAuthToken(
    admin._id,
    USER_TYPE.ADMIN,
    loginData.deviceToken,
    loginData.deviceType,
    loginData.deviceId,
  );

  return { admin: formatUser(admin), token: authToken };
};

export const updateProfile = async (updateData, token) => {
  const admin = await Admin.findByIdAndUpdate(
    token.admin._id,
    { $set: updateData },
    { new: true },
  ).lean();

  return admin;
};

export const changePassword = async (passwordData, token) => {
  if (!(await bcrypt.compare(passwordData.oldPassword, token.admin.password))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
  await Admin.findByIdAndUpdate(token.admin._id, {
    $set: { password: hashedPassword },
  });
  await logOutFromAllAdmin(token.admin._id);
};

export const logout = async (token) => {
  await deletePreviousToken(token._id);
};

export const getDashboardData = async (query) => {
  const baseFilter = {
    "payment.status": { $nin: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED] },
  };

  const totalUsers = await User.countDocuments({
    isVerified: true,
    isDeleted: false,
  });
  const totalProducts = await Product.countDocuments({ isDeleted: false });
  const totalOrders = await Order.countDocuments({});
  const recentOrders = await Order.find(
    {},
    {},
    { limit: 5, sort: { paidAt: -1 } },
  );

  let graphData = [];
  const ordersData = {};
  baseFilter["payment.paidAt"] = {
    $lte: moment().toISOString(),
  };

switch (query.data) {
    case "monthly":
      baseFilter["payment.paidAt"].$gte = moment().subtract(30, "days").toISOString();
      const ordersThisMonth = await Order.find(baseFilter, { payment: 1 }, { lean: true });
      graphData = formatGraphData(ordersThisMonth, "monthly");
      break;

    case "weekly":
      baseFilter["payment.paidAt"].$gte = moment().subtract(7, "days").toISOString();
      const ordersThisWeek = await Order.find(baseFilter, { payment: 1 }, { lean: true });
      graphData = formatGraphData(ordersThisWeek, "weekly");
      break;

    default:
      baseFilter["payment.paidAt"].$gte = moment().subtract(1, "year").toISOString();
      const ordersThisYear = await Order.find(baseFilter, { payment: 1 }, { lean: true });
      graphData = formatGraphData(ordersThisYear, "yearly");
      break;
  }

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    recentOrders,
    graphData,
    graphDataCount: graphData.length,
  };
};

export const getTransactionsData = async (query) => {
  const baseFilter = {
    "payment.status": { $nin: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED] },
  };

  const filter = { ...baseFilter };

  if (query.mode) {
    filter["payment.method"] = query.mode;
  }

  if (query.search) {
    filter.$or = [
      { orderId: { $regex: query.search } },
      { "payment.razorpayOrderId": { $regex: query.search } },
    ];
  }

  const [filteredTransactions, totalCount, revenueStats] = await Promise.all([
    // Paginated + filtered transactions
    Order.find(
      filter,
      {
        orderId: 1,
        "payment.razorpayOrderId": 1,
        "payment.paidOn": 1,
        "payment.status": 1,
        "payment.amount": 1,
        "payment.method": 1,
      },
      paginationOptions(query.page, query.limit),
    ),

    // Accurate count of filtered results
    Order.countDocuments(filter),

    // Total revenue via aggregation — no data pulled into memory
    Order.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$payment.amount" } },
        },
      },
    ]),
  ]);

  console.log(revenueStats);

  const totalRevenue = revenueStats[0]?.totalRevenue ?? 0;

  return {
    filteredTransactions,
    totalRevenue: totalRevenue.toFixed(2),
    totalTransactionsCount: totalCount,
    from: query.mode,
  };
};
