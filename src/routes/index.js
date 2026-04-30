import {Router} from "express";
import authRoute from "./user/auth.route.js";
import profileRoute from "./user/profile.route.js";
import adminAuthRoute from "./admin/auth.route.js"
import userRoute from "./admin/user.route.js";
import adminProductRoute from "./admin/product.route.js"
import constantsRoute from "./admin/aCAndVideo.route.js"
import commonRoutes from "./common.route.js"
import cartRoute from "./user/cart.route.js"
import staticRoutes from "./user/static.route.js"
import orderRoute from "./user/order.route.js"

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
    path: "/admin/constants",
    route: constantsRoute
  }, 
  {
    path: "/cart", 
    route: cartRoute 
  }, 
  {
    path: "/order", 
    route: orderRoute
  },
  ,
  {
    path: "/", 
    route: commonRoutes
  },
  {
    path: "/", 
    route: staticRoutes
  }, 
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;