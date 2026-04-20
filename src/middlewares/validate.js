import Joi from "joi"; // Importing Joi for validation
import { pick } from "../utils/universalFunctions.js"; // Destructuring 'pick' from a utility function file
import config from "../configs/config.js"; // Importing configuration settings
import { ValidationError } from "../utils/errors.js"; // Destructuring 'ValidationError' from custom errors

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);

  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    console.log("validation errorrrrrr", req.body, error);
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message.replace(/"/g, ""),
    }));

    return next(
      new ValidationError(
        errorMessages,
        error.details
          .map((details) => details.message)
          .join(", ")
          .replace(/"/g, "")
      )
    );
  }

  Object.assign(req, value);
  return next();
};

export { validate };
