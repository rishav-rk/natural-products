import SwaggerParser from "@apidevtools/swagger-parser"
import path from "path"
import { fileURLToPath } from "url"
import generateSchemas from "../docs/joiSchemas.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, "../docs/swagger.yaml")

let swaggerDocument

try {
  // 1. Load and resolve YAML
  swaggerDocument = await SwaggerParser.bundle(filePath)

  // 2. Generate Joi schemas
  const joiSchemas = generateSchemas()

  // 3. Inject into components.schemas
  swaggerDocument.components = swaggerDocument.components || {}
  swaggerDocument.components.schemas = {
    ...(swaggerDocument.components.schemas || {}),
    ...joiSchemas
  } 
} catch (err) {
  console.error("Swagger error:", err)
}

export default swaggerDocument