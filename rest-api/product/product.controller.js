import {
  createProduct,
  updateProduct,
  listProducts,
  deleteProduct,
} from "./product.service.js";
import { logInfo } from "#src/log.service.js";
import { pickFields, crudlSafe } from "#src/utils/index.js";
import {
  ADD_PRODUCT_ERRORS,
  UPDATE_PRODUCT_ERRORS,
  LIST_PRODUCTS_ERRORS,
  DELETE_PRODUCT_ERRORS,
} from "./product.error.js";

const PRODUCT_FIELDS = ["title", "price", "categoryId", "description"];

export async function createProductHandler(req, res) {
  crudlSafe(res, ADD_PRODUCT_ERRORS, async () => {
    console.log("Received create product request with body", req.body);
    const productInput = pickFields(req.body, PRODUCT_FIELDS);
    const product = await createProduct(productInput);
    res.json({ product });
    logInfo(`Response create product sent with status ${res.statusCode}`);
  });
}

export async function updateProductHandler(req, res) {
  crudlSafe(res, UPDATE_PRODUCT_ERRORS, async () => {
    console.log("Received update product request with body", req.body);
    const { id } = req.params;
    const productInput = pickFields(req.body, PRODUCT_FIELDS);
    const product = await updateProduct(id, productInput);
    res.json({ product });
    logInfo(`Response update product sent with status ${res.statusCode}`);
  });
}

export async function listProductsHandler(req, res) {
  crudlSafe(res, LIST_PRODUCTS_ERRORS, async () => {
    const products = await listProducts({ filterBy: req.query });
    res.json({ products });
    logInfo(`Response list products sent with status ${res.statusCode}`);
  });
}

export async function deleteProductHandler(req, res) {
  crudlSafe(res, DELETE_PRODUCT_ERRORS, async () => {
    const { id } = req.params;
    const deleted = await deleteProduct(id);
    if (!deleted) throw new Error("PRODUCT_NOT_FOUND");
    res.json({ id });
    logInfo(`Response delete product sent with status ${res.statusCode}`);
  });
}
