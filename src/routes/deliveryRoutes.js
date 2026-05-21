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
import { checkPincodeServiceability } from "../utils/delivery.js";

const router = Router();

router.get(
  "/getDeliverableStatus",
  catchAsync(async (req, res) => {
    const data = await checkPincodeServiceability();
    return successResponse(req, res, STATUS_CODES.SUCCESS, SUCCESS_MESSAGES.SUCCESS, data)
  }),
);



export default router;
