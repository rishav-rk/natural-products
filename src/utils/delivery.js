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

export const calculateShippingCost = async () => {

  const options = {
    method: "GET",
    url: `${config.delhivery.baseUrl}/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=110053&o_pin=110042&cgm=10&pt=Pre-paid`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${config.delhivery.secret}`,
    },
  };

  const result = await axios.request(options)
  console.log(result)
  return successResponse(req, res, 200, 'OK')
};
