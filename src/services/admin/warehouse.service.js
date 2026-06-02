import { Warehouse } from "../../models/index.js";
import { createDelhiveryWarehouse } from "../../utils/delivery.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const addWarehouse = async (warehouseData) => {
  try {
    // ── Step 1: Prepare location object with coordinates ─────
    const warehousePayload = {
      name: warehouseData.name,
      phone: warehouseData.phone,
      email: warehouseData.email,
      address: warehouseData.address,
      city: warehouseData.city,
      state: warehouseData.state,
      country: warehouseData.country || "India",
      pin: warehouseData.pin,
      gstNumber: warehouseData.gstNumber,
      return_address: warehouseData.return_address,
      return_pin: warehouseData.return_pin,
      return_city: warehouseData.return_city,
      return_state: warehouseData.return_state,
      return_country: warehouseData.return_country || "India",
      location: {
        type: "Point",
        coordinates: [warehouseData.longitude, warehouseData.latitude],
      },
    };

    // ── Step 2: Create warehouse in MongoDB ──────────────────
    const warehouse = await Warehouse.findOneAndUpdate(
      { name: warehouseData.name },
      warehousePayload,
      { new: true, upsert: true }
    );

    // ── Step 3: Create warehouse in Delhivery system ─────────
    const delhiveryResponse = await createDelhiveryWarehouse(warehouse.toObject());

    // ── Step 4: Return combined response ────────────────────
    return {
      _id: warehouse._id,
      name: warehouse.name,
      email: warehouse.email,
      city: warehouse.city,
      state: warehouse.state,
      pin: warehouse.pin,
      phone: warehouse.phone,
      delhiveryResponse,
      createdAt: warehouse.createdAt,
    };
  } catch (error) {
    if (error.message?.includes("[DELHIVERY]")) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        `Warehouse created in database but failed in Delhivery: ${error.message}`
      );
    }
    throw error;
  }
};

export const updateWarehouse = async (warehouseId, warehouseData) => {
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    throw new OperationalError(
      STATUS_CODES.NOT_FOUND,
      ERROR_MESSAGES.NOT_FOUND
    );
  }

  const updateFields = {};
  const scalarFields = [
    "name",
    "phone",
    "email",
    "address",
    "city",
    "state",
    "country",
    "pin",
    "gstNumber",
    "return_address",
    "return_pin",
    "return_city",
    "return_state",
    "return_country",
  ];

  for (const field of scalarFields) {
    if (warehouseData[field] !== undefined) {
      updateFields[field] = warehouseData[field];
    }
  }

  if (warehouseData.latitude !== undefined || warehouseData.longitude !== undefined) {
    const latitude = warehouseData.latitude ?? warehouse.location.coordinates[1];
    const longitude = warehouseData.longitude ?? warehouse.location.coordinates[0];
    updateFields.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
  }

  const updated = await Warehouse.findByIdAndUpdate(warehouseId, updateFields, {
    new: true,
    lean: true,
  });

  return updated;
};

export const deleteWarehouse = async (warehouseId) => {
  const warehouse = await Warehouse.findByIdAndUpdate(warehouseId, {isDeleted: true}, {new: true});
  if (!warehouse) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NOT_FOUND
    );
  }
  return warehouse;
};

export const getWarehouse = async (warehouseId) => {
  const warehouse = await Warehouse.findById(warehouseId).lean();
  if (!warehouse) {
    throw new OperationalError(
      STATUS_CODES.NOT_FOUND,
      ERROR_MESSAGES.NOT_FOUND
    );
  }
  return warehouse;
};

export const getAllWarehouses = async (filters, page, limit) => {
  const query = {
    isDeleted: false, 
  };
  
  if (filters.city) query.city = filters.city;
  if (filters.state) query.state = filters.state;

  const warehouses = await Warehouse.find(query, {}, paginationOptions(page, limit))

  const total = await Warehouse.countDocuments(query);

  return {
    data: warehouses,
    pagination: {
      total,
      page: page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};