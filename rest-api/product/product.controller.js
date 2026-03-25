import { upsertProduct, getProduct, listProducts } from "./product.service.js";
import { logInfo } from "#src/log.service.js";
import { pickFields, crudlSafe } from "#src/utils/index.js";
import {
  GET_PRODUCT_ERRORS,
  ADD_PRODUCT_ERRORS,
  LIST_PRODUCTS_ERRORS,
} from "./product.error.js";

const PRODUCT_FIELDS = ["title", "price", "category", "description"];

export async function getProductHandler(req, res) {
  crudlSafe(res, GET_PRODUCT_ERRORS, async () => {
    const { productId } = req.params;
    if (!productId) {
      throw new Error("PRODUCT_ID_REQUIRED");
    }
    const product = await getProduct(productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    res.json({ product });
    logInfo(`Response get product sent with status ${res.statusCode}`);
  });
}

export async function addProductHandler(req, res) {
  crudlSafe(res, ADD_PRODUCT_ERRORS, async () => {
    const productInput = pickFields(req.body, PRODUCT_FIELDS);
    const product = await upsertProduct(productInput);
    res.json({ product });
    logInfo(`Response upsert product sent with status ${res.statusCode}`);
  });
}

export async function listProductsHandler(req, res) {
  crudlSafe(res, LIST_PRODUCTS_ERRORS, async () => {
    const products = await listProducts({ filterBy: req.query });
    res.json({ products });
    logInfo(`Response list products sent with status ${res.statusCode}`);
  });
}
