import axios from "axios";
import config from "../config/config.js";
import { successResponse } from "./response.js";

export const checkPincodeServiceability = async (pincode) => {
  const options = {
    method: "GET",
    url: `${config.delhivery.baseUrl}/c/api/pin-codes/json/`,
    params: { filter_codes: pincode },
    headers: {
      Authorization: `Token ${config.delhivery.secret}`,
    },
  };

  const result = await axios.request(options);
  const codes = result.data?.delivery_codes;

  if (!codes || codes.length === 0) {
    return { serviceable: false, isOda: false };
  }

  const postal = codes[0]?.postal_code;
  const hasService = postal?.pre_paid === "Y" || postal?.cod === "Y";
  const isOda = postal?.is_oda === "Y";

  return {
    serviceable: hasService,
    isOda,
    details: postal,
  };
};

const checkShippingRate = async ({
  destinationPin,
  originPin,
  weight,
  paymentType = "Pre-paid",
  mode = "S",
}) => {
  const options = {
    method: "GET",
    url: `${config.delhivery.baseUrl}/api/kinko/v1/invoice/charges/.json`,
    params: {
      md: mode,
      ss: "Delivered",
      d_pin: destinationPin,
      o_pin: originPin,
      cgm: weight,
      pt: paymentType,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${config.delhivery.secret}`,
    },
  };

  const { data } = await axios.request(options);
  const rate = data[0];

  return {
    shippingFee: rate.total_amount,
    zone: rate.zone,
    chargedWeight: rate.charged_weight,
    isCOD: rate.charge_COD > 0,
  };
};
