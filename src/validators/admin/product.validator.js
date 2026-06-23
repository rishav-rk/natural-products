import { JOI } from "../../config/appConstants.js";
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
    stock: Joi.number().required().example(100).min(1),
    keywords: Joi.array()
      .items(Joi.string())
      .example(["aloe vera", "gel", "skincare"]),
    details: Joi.object({
      useBefore: Joi.string().required().example("3 years from Mfg. date"),
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
    backgroundColor: Joi.string().example("#000000"),
    weight: Joi.number()
      .required()
      .example("must be in kg, e.g. 0.3 for 300gm and 1 for 1kg"),
    discount: Joi.number()
      .required()
      .example("in percent like 49 for 49 % discount"),
  }).required(),
};

export const updateProduct = {
  params: Joi.object({
    productId: JOI.OBJECTID,
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
    keywords: Joi.array()
      .items(Joi.string())
      .example(["aloe vera", "gel", "skincare"]),
    details: Joi.object({
      useBefore: Joi.string().required().example("3 years from Mfg. date"),
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
    backgroundColor: Joi.string().example("#000000"),
    weight: Joi.number().required().example("300 for 300gm and 1000 for 1kg"),
    discount: Joi.number().max(90)
      .required()
      .example("in percent like 49 for 49 % discount"),
  }).required(),
};

export const deleteProduct = {
  params: Joi.object({
    productId: JOI.OBJECTID,
  }),
};

export const getProducts = {
  query: Joi.object({
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    search: Joi.string().example("aloe vera"),
  }),
};

export const getProductById = {
  params: Joi.object({
    productId: JOI.OBJECTID,
  }),
};
