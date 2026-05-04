import j2s from "joi-to-swagger";
import * as authValidation from "../validators/user/auth.validator.js";
import * as profileValidation from "../validators/user/profile.validator.js";
import * as userValidation from "../validators/admin/user.validator.js";
import * as adminAuthValidation from "../validators/admin/auth.validator.js";
import * as productValidation from "../validators/admin/product.validator.js"
import * as orderValidation from "../validators/admin/order.validator.js"


const generateSchemas = () => {
  const schemas = {};

  const validatorSources = [
    authValidation,
    profileValidation,
    userValidation, 
    adminAuthValidation, 
    productValidation,
    orderValidation
  ];

  // Process each validator source
  validatorSources.forEach((validators) => {
    Object.keys(validators).forEach((key) => {
      const schemaObj = validators[key];

      if (schemaObj.body) {
        const { swagger } = j2s(schemaObj.body);
        schemas[`${key}Request`] = swagger;
      }

      if (schemaObj.query) {
        const { swagger } = j2s(schemaObj.query);
        schemas[`${key}Query`] = swagger;
      }

      if (schemaObj.params) {
        const { swagger } = j2s(schemaObj.params);
        schemas[`${key}Params`] = swagger;
      }
    });
  });

  return schemas;
};

export default generateSchemas;

