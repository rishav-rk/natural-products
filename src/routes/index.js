import {Router} from "express";
import authRoute from "./user/auth.route.js";
import profileRoute from "./user/profile.route.js";
import adminAuthRoute from "./admin/auth.route.js"
import userRoute from "./admin/user.route.js";
import adminProductRoute from "./admin/product.route.js"
import commonProductRoute from "./product.route.js"

const router = Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/profile",
    route: profileRoute,
  }, 
  {
    path: "/admin",
    route: adminAuthRoute,
  }, 
  {
    path: "/admin/users",
    route: userRoute,
  }, 
  {
    path: "/admin/products", 
    route: adminProductRoute
  },
  {
    path: "/products", 
    route: commonProductRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;