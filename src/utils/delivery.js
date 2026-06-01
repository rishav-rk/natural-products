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

export const checkShippingRate = async ({
  destinationPin,
  weight
}) => {
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
    name: 'Delhi WH',
    email: 'delhi-wh@yourcompany.com',
    address: '123 Warehouse Road, Okhla Phase II',
    phone: "9876543210",
    city: 'New Delhi',
    country: 'India',
    pin: '110020',
    return_address: '123 Warehouse Road, Okhla Phase II',
    return_pin: '110020',
    return_city: 'New Delhi',
    return_state: 'Delhi',
    return_country: 'India',
  },
  {
    headers: {
      Authorization: `Token ${config.delhivery.secret}`,
      'Content-Type': 'application/json',
    },
  }
)

console.log('Warehouse created:', response.data);
return response.data;
}


const delhiveryHeaders = {
  "Content-Type": "application/json",
  Authorization: `Token ${config.delhivery.secret}`,
};

const delhiveryHeadersForShipmentCreation = {
  "Content-Type": "application/x-www-form-urlencoded",
  Authorization: `Token ${config.delhivery.secret}`,
};

export const createDelhiveryShipment = async ({ order, warehouse }) => {
  const address = order.shippingAddress;

  // build full address string from split fields
  const fullAddress = [
    address.houseNumberAndFloor,
    address.buildingAndBlock,
    address.landMarkAndArea,
  ]
    .filter(Boolean)
    .join(", ");

  const shipmentData = {
    shipments: [
      {
        // ── Delivery address ──────────────────────────────
        name:    order.userName || "Customer",
        add:     fullAddress,
        city:    address.city,
        state:   address.state,
        country: address.country || "India",
        pin:     String(address.pincode),
        phone:   order.userPhone || "",

        // ── Order info ────────────────────────────────────
        order:         order.orderId,
        payment_mode:  "Prepaid",
        cod_amount:    0,
        total_amount:  parseFloat(order.grandTotalAmount),
        weight:        calculateTotalWeight(order.products),
        products_desc: order.products.map((p) => p.name).join(", "),
        quantity:      order.products.reduce((sum, p) => sum + p.quantity, 0),
        shipping_mode: "Surface",
        address_type:  address.type?.toLowerCase() || "home",

        // ── Pickup / seller (from warehouse schema) ───────
        seller_name:    warehouse.name,
        seller_add:     warehouse.address,
        seller_city:    warehouse.city,
        seller_state:   warehouse.state,
        seller_pin:     String(warehouse.pin),
        seller_phone:   String(warehouse.phone),
        seller_gst_tin: warehouse.gstNumber || "",

        // ── Return address (falls back to warehouse) ──────
        rto_name:    warehouse.name,
        rto_add:     warehouse.return_address || warehouse.address,
        rto_city:    warehouse.return_city    || warehouse.city,
        rto_state:   warehouse.return_state   || warehouse.state,
        rto_pin:     String(warehouse.return_pin || warehouse.pin),
        rto_phone:   String(warehouse.phone),
        rto_country: warehouse.return_country || "India",
      },
    ],
    pickup_location: {
      name: warehouse.name,
    },
  };

  const body = `format=json&data=${JSON.stringify(shipmentData)}`;

  const { data: result } = await axios.post(
    `${config.delhivery.baseUrl}/api/cmu/create.json`,
    body,
    { headers: delhiveryHeadersForShipmentCreation }
  );

  const shipment = result.packages?.[0];

  if (!shipment || shipment.status === "Error") {
    throw new Error(`[DELHIVERY] ${shipment?.remarks || "Unknown error from Delhivery"}`);
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
    name:             warehouse.name,
    registered_name:  warehouse.registeredName || warehouse.name,
    contact_person:   warehouse.contactPerson,
    email:            warehouse.email,

    // ── Address ────────────────────────────────────────
    address:          warehouse.address,
    city:             warehouse.city,
    state:            warehouse.state,
    country:          warehouse.country || "India",
    pin:              String(warehouse.pin),

    // ── Contact ────────────────────────────────────────
    phone:            String(warehouse.phone),
  };

  const { data: result } = await axios.post(
    `${config.delhivery.baseUrl}/api/backend/clientwarehouse/create/`,
    payload,
    { headers: delhiveryHeaders }
  );

  if (!result.success) {
    throw new Error(`[DELHIVERY] Warehouse creation failed: ${result.message || "Unknown error"}`);
  }

  return {
    warehouseName:   result.data?.name    || warehouse.name,
    city:            result.data?.city    || warehouse.city,
    state:           result.data?.state   || warehouse.state,
    pin:             result.data?.pin     || String(warehouse.pin),
    phone:           result.data?.phone   || String(warehouse.phone),
  };
};