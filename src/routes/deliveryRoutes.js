import { Router } from "express";
import axios from "axios";
import { catchAsync } from "../utils/universalFunctions.js";
import { successResponse } from "../utils/response.js";
import {
  SUCCESS_MESSAGES,
  STATUS_CODES,
  ERROR_MESSAGES,
} from "../config/appConstants.js";
import { OperationalError } from "../utils/error.js";
import {
  checkPincodeServiceability,
  createWarehouse
} from "../utils/delivery.js";

const router = Router();

router.get(
  "/getDeliverableStatus",
  catchAsync(async (req, res) => {
    const data = await checkPincodeServiceability();
    return successResponse(
      req,
      res,
      STATUS_CODES.SUCCESS,
      SUCCESS_MESSAGES.SUCCESS,
      data,
    );
  }),
);

router.post(
  "/create-warehouse",
  catchAsync(async (req, res) => {
    const data = await createWarehouse();
    return successResponse(
      req,
      res,
      STATUS_CODES.SUCCESS,
      SUCCESS_MESSAGES.SUCCESS,
      data,
    );
  }),
);

router.get("/get-all-warehouses", async (req, res) => {
  try {
    const data = await getAllWarehouses();
    console.log(data);
    return successResponse(
      req,
      res,
      STATUS_CODES.SUCCESS,
      SUCCESS_MESSAGES.SUCCESS,
      data,
    );
  } catch (error) {
    console.error("Error fetching warehouses:", error.message);
    throw new OperationalError(
      STATUS_CODES.ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
});

export default router;
