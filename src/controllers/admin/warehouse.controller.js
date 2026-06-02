import { catchAsync } from "../../utils/universalFunctions.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import * as warehouseService from "../../services/admin/warehouse.service.js";

export const addWarehouse = catchAsync(async (req, res) => {
  const warehouseData = await req.body;
  const warehouse = await warehouseService.addWarehouse(warehouseData);

  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.WAREHOUSE_CREATED,
    warehouse
  );
});

export const getWarehouses = catchAsync(async (req, res) => {
  const warehouses = await warehouseService.getAllWarehouses(
    { search: req.query.search, city: req.query.city, state: req.query.state },
    req.query.page,
    req.query.limit,
  );
  console.log("Warehouses : ", warehouses);

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    warehouses,
  );
});

export const updateWarehouse = catchAsync(async (req, res) => {
  console.log(
    "Warehouse Data : ",
    req.body,
    "\nWarehouse ID : ",
    req.params.id,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const getWarehouseById = catchAsync(async (req, res) => {
  const warehouse = await warehouseService.getWarehouse(req.params.id);
  console.log("Warehouse : ", warehouse);

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    warehouse
  );
});

export const deleteWarehouse = catchAsync(async (req, res) => {
  await warehouseService.deleteWarehouse(req.params.id);
  console.log("Warehouse deleted with ID : ", req.params.id);

  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});