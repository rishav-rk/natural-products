import {Router} from "express";
import authRoute from "./user/auth.route.js";
import profileRoute from "./user/profile.route.js";
import adminAuthRoute from "./admin/auth.route.js"

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
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;