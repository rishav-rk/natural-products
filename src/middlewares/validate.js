import Joi from "joi";
import { pick } from "../utils/universalFunctions.js";
import { ValidationError } from "../utils/error.js";

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .tailor("request")
    .prefs({ errors: { label: "key" }, abortEarly: false, allowUnknown: false })
    .validate(object);

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message.replace(/"/g, ""),
    }));

    const combinedMessage = errorMessages.map((e) => e.message).join(", ");

    return next(new ValidationError(errorMessages, combinedMessage));
  }

  Object.assign(req, value);
  return next();
};

export { validate };