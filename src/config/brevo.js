import config from "./config.js"
import { BrevoClient } from "@getbrevo/brevo";

const brevoClient = new BrevoClient({apiKey: config.brevoApiKey, maxRetries: 2, })

export default brevoClient