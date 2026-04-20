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
      TWILIO_ACCOUNT_SID: Joi.string().required().description('twilio account sid'),
      TWILIO_AUTH_TOKEN: Joi.string().required().description('twilio authentication token'), 
      TWILIO_PHONE_NUMBER: Joi.string().required().description('twilio sender phone number')
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
  twilio: {
    accountSid:envVars.TWILIO_ACCOUNT_SID,
    authToken:envVars.TWILIO_AUTH_TOKEN, 
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
  },
  environment: envVars.ENVIRONMENT,
};
