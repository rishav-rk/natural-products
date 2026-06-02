import { Router } from "express";
import * as adminValidator from "../../validators/admin/auth.validator.js";
import { validate } from "../../middlewares/validate.js";
import * as adminController from "../../controllers/admin/auth.controller.js";
import * as warehouseValidator from "../../validators/admin/warehouse.validator.js";
import * as warehouseController from "../../controllers/admin/warehouse.controller.js";
import auth from "../../middlewares/auth.js";
import { USER_TYPE } from "../../config/appConstants.js";

const router = Router();

router.post(
  "/auth/login",
  validate(adminValidator.loginAdminValidator),
  adminController.login,
);

router.get("/profile", auth(USER_TYPE.ADMIN), adminController.getProfile);

router.patch(
  "/profile/change-password",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.changeAdminPasswordValidator),
  adminController.changePassword,
);

router.put(
  "/profile/update-profile",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.updateAdminProfileValidator),
  adminController.updateProfile,
);

router.post("/auth/logout", auth(USER_TYPE.ADMIN), adminController.logout);

router.get(
  "/dashboard",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.getDashboardValidator),
  adminController.getDashboard,
);

router.get(
  "/transactions",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.getTransactionsValidator),
  adminController.getTransactions,
);

router.post(
  "/warehouses",
  auth(USER_TYPE.ADMIN),
  validate(warehouseValidator.createWarehouseValidator),
  warehouseController.addWarehouse,
);

router.put(
  "/warehouses/:id",
  auth(USER_TYPE.ADMIN),
  validate(warehouseValidator.updateWarehouseValidator),
  warehouseController.updateWarehouse,
);

router.get(
  "/warehouses",
  auth(USER_TYPE.ADMIN),
  validate(warehouseValidator.getWarehousesValidator),
  warehouseController.getWarehouses,
);

router.get(
  "/warehouses/:id",
  auth(USER_TYPE.ADMIN),
  validate(warehouseValidator.getWarehouseByIdValidator),
  warehouseController.getWarehouseById,
);

router.delete(
  "/warehouses/:id",
  auth(USER_TYPE.ADMIN),
  validate(warehouseValidator.deleteWarehouseValidator),
  warehouseController.deleteWarehouse,
);

export default router;
