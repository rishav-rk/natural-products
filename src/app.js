import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import passport from "passport";
import path from "path";
import fileUpload from "express-fileupload";
import morgan from "morgan";

import { jwtStrategy } from "./config/passport.js";
import routes from "./routes/index.js";
import deliveryRoutes from "./routes/deliveryRoutes.js"

import swaggerUI from "swagger-ui-express"
import swaggerSpec from "./config/swagger.js"

import {
  errorHandler,
  authLimiter,
  requestHandler,
  routeNotFoundHandler,
} from "./middlewares/common.js";
import i18n from "./middlewares/i18n.js";
import config from "./config/config.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(i18n.init);

app.use((req, res, next) => {
  requestHandler(req, res, next);
});

app.use(fileUpload());


// parse json request body
app.use(express.json());

//swagger 
if(config.environment !== 'production'){
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
}

app.use(
  morgan("dev", {
    skip: (req) => req.method === "OPTIONS",
    //  skip OPTIONS method request in logs
  }),
);

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression

// enable cors
app.use(cors());

app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// v1 api routes
app.use("/delhivery", deliveryRoutes)
app.use("/api", routes);

//send back a 404 error for any unknown api request
app.use((req, res, next) => {
  routeNotFoundHandler(req, res, next);
});

// handle error

app.use(errorHandler);

export default app;
