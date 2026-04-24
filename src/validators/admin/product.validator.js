import {JOI} from "../../config/appConstants.js";
import Joi from "joi";

export const addProduct = {
  body: Joi.object({
    name: Joi.string().required().example("Aloe Vera Gel"),
    description: Joi.string()
      .required()
      .example(
        "Aloe Vera Gel is a natural product that is derived from the leaves of the Aloe Vera plant. It is known for its soothing and healing properties, making it a popular choice for skincare and medicinal purposes. Aloe Vera Gel is rich in vitamins, minerals, and antioxidants, which can help to nourish and protect the skin. It is commonly used to treat sunburns, minor cuts, and skin irritations, as well as to moisturize and improve the overall health of the skin.",
      ),
    benefits: Joi.string()
      .required()
      .example(
        "1. Soothes sunburns: Aloe Vera Gel has cooling properties that can help to relieve the pain and redness associated with sunburns. 2. Moisturizes the skin: Aloe Vera Gel is a natural moisturizer that can help to hydrate and soft the skin. 3. Heals wounds: Aloe Vera Gel has antibacterial and anti-inflammatory properties that can help to promote wound healing and reduce the risk of infection. 4. Reduces acne: Aloe Vera Gel can help to reduce inflammation and redness associated with acne, as well as to prevent future breakouts. 5. Anti-aging properties: Aloe Vera Gel contains antioxidants that can help to protect the skin from damage caused by free radicals, which can contribute to premature aging.",
      ),
    price: Joi.string().required().example("19.99"),
    stock: Joi.number().required().example(100),
    category: JOI.OBJECTID.required().example("60c72b2f9b1d8e5a5c8f9b1a"),
    keywords: Joi.array()
      .items(Joi.string())
      .example(["aloe vera", "gel", "skincare"]),
    details: Joi.object({
      userBefore: Joi.string().required().example("3 years from Mfg. date"),
      approvedName: Joi.string().required().example("Aloe Vera Gel / 46AQA-AP"),
    }).required(),
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(5)
      .required()
      .example([
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ]),
  }).required(),
};

export const updateProduct = {
    params : Joi.object({
        productId: JOI.OBJECTID
    }).required(), 
      body: Joi.object({
    name: Joi.string().required().example("Aloe Vera Gel"),
    description: Joi.string()
      .required()
      .example(
        "Aloe Vera Gel is a natural product that is derived from the leaves of the Aloe Vera plant. It is known for its soothing and healing properties, making it a popular choice for skincare and medicinal purposes. Aloe Vera Gel is rich in vitamins, minerals, and antioxidants, which can help to nourish and protect the skin. It is commonly used to treat sunburns, minor cuts, and skin irritations, as well as to moisturize and improve the overall health of the skin.",
      ),
    benefits: Joi.string()
      .required()
      .example(
        "1. Soothes sunburns: Aloe Vera Gel has cooling properties that can help to relieve the pain and redness associated with sunburns. 2. Moisturizes the skin: Aloe Vera Gel is a natural moisturizer that can help to hydrate and soft the skin. 3. Heals wounds: Aloe Vera Gel has antibacterial and anti-inflammatory properties that can help to promote wound healing and reduce the risk of infection. 4. Reduces acne: Aloe Vera Gel can help to reduce inflammation and redness associated with acne, as well as to prevent future breakouts. 5. Anti-aging properties: Aloe Vera Gel contains antioxidants that can help to protect the skin from damage caused by free radicals, which can contribute to premature aging.",
      ),
    price: Joi.string().required().example("19.99"),
    stock: Joi.number().required().example(100),
    category: JOI.OBJECTID.required().example("60c72b2f9b1d8e5a5c8f9b1a"),
    keywords: Joi.array()
      .items(Joi.string())
      .example(["aloe vera", "gel", "skincare"]),
    details: Joi.object({
      userBefore: Joi.string().required().example("3 years from Mfg. date"),
      approvedName: Joi.string().required().example("Aloe Vera Gel / 46AQA-AP"),
    }).required(),
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(5)
      .required()
      .example([
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ]),
  }).required()
}