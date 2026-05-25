import moment from "moment-timezone";
//import moment from "moment";
import { DATE_FORMAT } from "../config/appConstants.js";
export const convertToTimeZone = (date, timeZone) => {
  return moment(date).tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
};

export function convertToUTC(date, timeZone) {
  // Parse the date string in the specified time zone
  const zonedTime = moment.tz(date, timeZone);

  // Convert to UTC
  return zonedTime.utc();
}
export const convertStringToDate = (date) => {
  return moment(date + "Z", DATE_FORMAT + "Z").toDate();
};

export const formatProducts = (product) => {
    delete product.createdAt
    delete product.updatedAt
    delete product.isDeleted
    delete product.__v
  return product
}

export const formatGraphData = (orders, type) => {
  const result = {};

  // Initialize buckets
  if (type === "yearly") {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months.forEach((m) => (result[m] = { label: m, orders: 0, amount: 0 }));
  } else if (type === "monthly") {
    for (let d = 1; d <= 30; d++) result[d] = { label: d, orders: 0, amount: 0 };
  } else if (type === "weekly") {
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    days.forEach((d) => (result[d] = { label: d, orders: 0, amount: 0 }));
  }

  // Aggregate orders into buckets
  orders.forEach((order) => {
    const paidAt = moment(order.payment.paidAt);
    let key;

    if (type === "yearly") {
      key = paidAt.format("MMM"); // "Jan", "Feb", ...
    } else if (type === "monthly") {
      key = paidAt.date(); // 1–30
    } else if (type === "weekly") {
      key = paidAt.format("ddd"); // "Mon", "Tue", ...
    }

    if (result[key] !== undefined) {
      result[key].orders += 1;
      result[key].amount += parseFloat(order.payment.amount) ?? 0; // adjust field name as needed
    }
  });
  Object.values(result).forEach(item=>item.amount = parseFloat(item.amount).toFixed(2))
  return Object.values(result);
};

export const formatUser = (user) => {
  delete user?.isDeleted;
  delete user?.isVerified;
  delete user?.password;
  delete user?.createdAt;
  delete user?.updatedAt;
  delete user?.__v;
  return user;
};
