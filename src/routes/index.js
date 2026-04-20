import {Router} from "express";
import authRoute from "./user/auth.route.js";
import testRoutes from "./user/test.route.js";

const router = Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/", 
    route: testRoutes
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;