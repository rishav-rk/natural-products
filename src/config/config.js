import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import { fileURLToPath } from "url";
import { ENVIRONMENT } from "./appConstants.js";

const __dirname = fileURLToPath(new URL(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().required(),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),

    PROJECT_NAME: Joi.string().required().description("Name of project"),

    ENVIRONMENT: Joi.string()
      .required()
      .valid(...Object.values(ENVIRONMENT)),

    RAZORPAY_KEY_ID: Joi.string()
      .required()
      .description("Razorpay key id required"),
    RAZORPAY_KEY_SECRET: Joi.string()
      .required()
      .description("Razorpay secret key required"),
    MESSAGE91_AUTH_KEY: Joi.string().required().description("MSG91 secret key"),
    BREVO_API_KEY: Joi.string()
      .required()
      .description("Brevo api key is required"),
    SENDER_EMAIL: Joi.string().required().description("sender email address"),
    TEST_MAIL: Joi.string()
      .required()
      .description("test mail address for development environment"),
    DELHIVERY_API_TOKEN: Joi.string()
      .required()
      .description("Delhivery api token required"),
    DELHIVERY_BASE_URL: Joi.string()
      .required()
      .description("Delhivery production url is required"),
    DELHIVERY_BASE_TEST_URL: Joi.string().description("Delhivery testing url"),
    WAREHOUSE_NAME: Joi.string()
      .required()
      .description("warehouse name is required"),
    WAREHOUSE_PINCODE: Joi.string()
      .required()
      .description("warehouse pincode is required"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error}`);
}

export default {
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationDays: envVars.JWT_ACCESS_EXPIRATION_DAYS,
  },
  baseurl: envVars.HOST_URL,
  projectName: envVars.PROJECT_NAME,
  environment: envVars.ENVIRONMENT,
  razorpay: {
    id: envVars.RAZORPAY_KEY_ID,
    secret: envVars.RAZORPAY_KEY_SECRET,
  },
  msg91Secret: envVars.MESSAGE91_AUTH_KEY,
  brevo: {
    apiKey: envVars.BREVO_API_KEY,
    senderEmail: envVars.SENDER_EMAIL,
    testMail: envVars.TEST_MAIL,
  },
  delhivery: {
    secret: envVars.DELHIVERY_API_TOKEN,
    baseUrl: envVars.DELHIVERY_BASE_URL,
    testUrl: envVars.DELHIVERY_BASE_TEST_URL,
    warehouseName: envVars.WAREHOUSE_NAME,
    warehousePincode: envVars.WAREHOUSE_PINCODE,
  },
};
