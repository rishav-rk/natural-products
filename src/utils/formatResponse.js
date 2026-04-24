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

export const formatUser = (user) => {
  delete user?.isDeleted;
  delete user?.isVerified;
  delete user?.password;
  delete user?.createdAt;
  delete user?.updatedAt;
  delete user?.__v;
  return user;
};
