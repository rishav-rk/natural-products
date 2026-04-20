import j2s from "joi-to-swagger";
import * as authValidation from "../validators/user/auth.validator.js";


const generateSchemas = () => {
  const schemas = {};

  Object.keys(authValidation).forEach((key) => {
    const schemaObj = authValidation[key];
    
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

  return schemas;
};

export default generateSchemas;

