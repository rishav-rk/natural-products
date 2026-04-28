import AdditionalCharges from "../../models/additionalCharges.model.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";

export const getConstants = async () => {
  let constants = await AdditionalCharges.findOne();
  
  if (!constants) {
    constants = await AdditionalCharges.create({});
  }
  
  return constants;
};

export const updateConstants = async (updateData) => {
  const constants = await AdditionalCharges.findOneAndUpdate(
    {},
    updateData,
    { new: true, upsert: true }
  );
  
  if (!constants) {
    throw new OperationalError(
      ERROR_MESSAGES.SOMETHING_WENT_WRONG,
      STATUS_CODES.SERVER_ERROR
    );
  }
  
  return constants;
};
