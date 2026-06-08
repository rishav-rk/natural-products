import axios from "axios";
import config from "../config/config.js";
import { successResponse } from "./response.js";
import { OperationalError } from "./error.js";
import { STATUS_CODES } from "../config/appConstants.js";

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

export const checkShippingRate = async ({ destinationPin, weight }) => {
  const options = {
    method: "GET",
    url: `${config.delhivery.baseUrl}/api/kinko/v1/invoice/charges/.json`,
    params: {
      md: "S",
      ss: "Delivered",
      d_pin: destinationPin,
      o_pin: config.delhivery.warehousePincode,
      cgm: weight,
      pt: "Pre-paid",
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

export const createWarehouse = async () => {
  const response = await axios.post(
    `${config.delhivery.baseUrl}/api/backend/clientwarehouse/create/`,
    {
      name: "Delhi WH",
      email: "delhi-wh@yourcompany.com",
      address: "123 Warehouse Road, Okhla Phase II",
      phone: "9876543210",
      city: "New Delhi",
      country: "India",
      pin: "110020",
      return_address: "123 Warehouse Road, Okhla Phase II",
      return_pin: "110020",
      return_city: "New Delhi",
      return_state: "Delhi",
      return_country: "India",
    },
    {
      headers: {
        Authorization: `Token ${config.delhivery.secret}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log("Warehouse created:", response.data);
  return response.data;
};

const delhiveryHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Token ${config.delhivery.secret}`,
};

const delhiveryHeadersForShipmentCreation = {
  "Content-Type": "application/x-www-form-urlencoded",
  Authorization: `Token ${config.delhivery.secret}`,
};

export const createDelhiveryShipment = async ({ order, warehouse }) => {
  const address = order.shippingAddress;

  console.log("order: ", order)
  console.log("warehouse: ", warehouse)
  // ── Sanitize helper ──────────────────────────────────────
  const clean = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/[\r\n\t]/g, " ")   // strip newlines/tabs
      .replace(/['"]/g, "")         // remove quotes entirely (safest for Delhivery)
      .trim();
  };

  const fullAddress = [
    address.houseNumberAndFloor,
    address.buildingAndBlock,
    address.landMarkAndArea,
  ]
    .filter(Boolean)
    .map(clean)      // ← sanitize each segment before joining
    .join(", ");

  const shipmentData = {
    shipments: [
      {
        name:         clean(order.userName) || "Customer",
        add:          fullAddress,
        city:         clean(address.city),
        state:        clean(address.state),
        country:      clean(address.country) || "India",
        pin:          String(address.pincode),
        phone:        clean(order.userPhone),

        order:        order.orderId,
        payment_mode: "Prepaid",
        cod_amount:   0,
        total_amount: parseFloat(order.grandTotalAmount),
        weight:       calculateTotalWeight(order.products),
        products_desc: clean(order.products.map((p) => p.name).join(" | ")), // ← avoid commas in desc
        quantity:     order.products.reduce((sum, p) => sum + p.quantity, 0),
        shipping_mode: "Surface",
        address_type: clean(address.type?.toLowerCase()) || "home",

        seller_name:    clean(warehouse.name),
        seller_add:     clean(warehouse.address),
        seller_city:    clean(warehouse.city),
        seller_state:   clean(warehouse.state),
        seller_pin:     String(warehouse.pin),
        seller_phone:   String(warehouse.phone),
        seller_gst_tin: clean(warehouse.gstNumber),

        rto_name:    clean(warehouse.name),
        rto_add:     clean(warehouse.return_address || warehouse.address),
        rto_city:    clean(warehouse.return_city    || warehouse.city),
        rto_state:   clean(warehouse.return_state   || warehouse.state),
        rto_pin:     String(warehouse.return_pin    || warehouse.pin),
        rto_phone:   String(warehouse.phone),
        rto_country: clean(warehouse.return_country) || "India",
      },
    ],
    pickup_location: {
      name: clean(warehouse.name),
    },
  };

  console.log("shipment data: ", shipmentData)

  // ── Debug: confirm JSON is valid & inspect char 37 ──────
  const jsonString = JSON.stringify(shipmentData);
  console.log("[Delhivery] Payload char 30-50:", jsonString.substring(30, 50));
  try {
    JSON.parse(jsonString); // sanity check
  } catch (e) {
    throw new Error(`[DELHIVERY] Malformed payload: ${e.message}`);
  }

  const body = `format=json&data=${jsonString}`;

  const { data: result } = await axios.post(
    `${config.delhivery.baseUrl}/api/cmu/create.json`,
    body,
    { headers: delhiveryHeadersForShipmentCreation },
  );

  console.log("Delhivery response:", result);

  const shipment = result.packages?.[0];

  if (!shipment || shipment.status === "Error") {
    throw new Error(
      `[DELHIVERY] ${shipment?.remarks || result?.rmk || "Unknown error from Delhivery"}`,
    );
  }

  return {
    waybillNumber: shipment.waybill,
    courierName:   "Delhivery",
    status:        shipment.status,
  };
};

export const calculateTotalWeight = (products) => {
  return products.reduce((total, item) => {
    const weight = item.weight ?? 300;
    return total + weight * item.quantity;
  }, 0);
};

export const createDelhiveryWarehouse = async (warehouse) => {
  const payload = {
    // ── Identity ───────────────────────────────────────
    name: warehouse.name,
    registered_name: warehouse.registeredName || warehouse.name,
    email: warehouse.email,

    // ── Address ────────────────────────────────────────
    address: warehouse.address,
    city: warehouse.city,
    state: warehouse.state,
    country: warehouse.country || "India",
    pin: String(warehouse.pin),

    // ── Contact ────────────────────────────────────────
    phone: String(warehouse.phone),

    return_address: warehouse.return_address || warehouse.address,
    return_city: warehouse.return_city || warehouse.city,
    return_state: warehouse.return_state || warehouse.state,
    return_country: warehouse.return_country || warehouse.country || "India",
    return_pin: String(warehouse.return_pin || warehouse.pin),

    // ── GST (optional) ─────────────────────────────────
    gst_number: warehouse.gstNumber || "",
  };

  try {
    const { data: result } = await axios.post(
      `${config.delhivery.baseUrl}/api/backend/clientwarehouse/create/`,
      payload,
      { headers: delhiveryHeaders },
    );

    console.log(result);

    if (!result.success) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        `[DELHIVERY] Warehouse creation failed: ${result.message || "Unknown error"}`,
      );
    }

    return {
      warehouseName: result.data?.name || warehouse.name,
      city: result.data?.city || warehouse.city,
      state: result.data?.state || warehouse.state,
      pin: result.data?.pin || String(warehouse.pin),
      phone: result.data?.phone || String(warehouse.phone),
    };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.[0] || 
                     error.response?.data?.message || 
                     error.message ||
                     "Unknown error";
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `[DELHIVERY] Warehouse creation failed: ${errorMsg}`,
    );
  }
};
