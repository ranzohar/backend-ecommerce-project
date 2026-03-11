import {
  upsertProduct,
  // deleteProduct,
  getProduct,
  listProducts,
} from "./product.service.js";
import { getNewId } from "#src/mongodb/mongodb.service.js";
import { logError, logInfo } from "#src/log.service.js";
import { pickFields, HTTP_STATUS } from "#src/utils/index.js";

const PRODUCT_FIELDS = ["title", "price", "category", "description"];

export async function getProductHandler(req, res) {
  const { productId } = req.params;
  if (!productId) {
    res.status(400).json({
      message: "Product id is required",
      code: "PRODUCT_ID_REQUIRED",
    });
    return;
  }

  try {
    const product = await getProduct(productId);
    if (!product) {
      res.status(404).json({
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
        productId,
      });
      return;
    }
    res.json({ product });
    logInfo(`Response get product sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to read product data: ${err?.message ?? err}`);
    res.status(500).json({
      message: "Failed to read product data",
      code: "GET_PRODUCT_FAILED",
      details: err?.message,
    });
  }
}

export async function addProductHandler(req, res) {
  const productId = getNewId();

  try {
    const productInput = pickFields(req.body, PRODUCT_FIELDS);
    const product = await upsertProduct(productId, productInput);
    res.json({ productId, product });
    logInfo(`Response upsert product sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to write product data: ${err?.message ?? err}`);
    if (err?.message === "CATEGORY_NOT_FOUND") {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Category not found",
        code: "CATEGORY_NOT_FOUND",
      });
      return;
    }
    if (err?.message === "PRODUCT_TITLE_TAKEN") {
      res.status(HTTP_STATUS.CONFLICT).json({
        message: "Product title already exists",
        code: "PRODUCT_TITLE_TAKEN",
      });
      return;
    }
    res.status(500).json({
      message: "Failed to write product data",
      code: "WRITE_PRODUCT_FAILED",
      details: err?.message,
    });
  }
}

// export async function deleteProductHandler(req, res) {
//   const { productId } = req.params;
//   if (!productId) {
//     res.status(400).json({
//       message: "Product id is required",
//       code: "PRODUCT_ID_REQUIRED",
//     });
//     return;
//   }

//   try {
//     const deleted = await deleteProduct(productId);
//     if (!deleted) {
//       res.status(404).json({
//         message: "Product not found",
//         code: "PRODUCT_NOT_FOUND",
//         productId,
//       });
//       return;
//     }
//     res.json({ message: "Deleted product", productId });
//     logInfo(`Response delete product sent with status ${res.statusCode}`);
//   } catch (err) {
//     logError(`Failed to delete product data: ${err?.message ?? err}`);
//     res.status(500).json({
//       message: "Failed to delete product data",
//       code: "DELETE_PRODUCT_FAILED",
//       details: err?.message,
//     });
//   }
// }

export async function listProductsHandler(req, res) {
  try {
    const products = await listProducts({ filterBy: req.query });
    res.json({ products });
    logInfo(`Response list products sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to read products data: ${err?.message ?? err}`);
    res.status(500).json({
      message: "Failed to read products data",
      code: "LIST_PRODUCTS_FAILED",
      details: err?.message,
    });
  }
}
