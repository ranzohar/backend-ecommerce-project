import { HTTP_STATUS } from "#src/utils/index.js";

export const INVALID_PRICE = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "INVALID_PRICE",
  message: "Product price must be greater than 0",
});

export const PRODUCT_NOT_FOUND = Object.freeze({
  status: HTTP_STATUS.NOT_FOUND,
  code: "PRODUCT_NOT_FOUND",
  message: "Product not found",
});

export const PRODUCT_TITLE_TAKEN = Object.freeze({
  status: HTTP_STATUS.CONFLICT,
  code: "PRODUCT_TITLE_TAKEN",
  message: "Product title already exists",
});

export const CATEGORY_NOT_FOUND = Object.freeze({
  status: HTTP_STATUS.NOT_FOUND,
  code: "CATEGORY_NOT_FOUND",
  message: "Category not found",
});

export const GET_PRODUCT_ERRORS = Object.freeze({
  PRODUCT_NOT_FOUND: PRODUCT_NOT_FOUND,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "GET_PRODUCT_FAILED",
    message: "Failed to read product data",
  }),
});

export const ADD_PRODUCT_ERRORS = Object.freeze({
  INVALID_PRICE: INVALID_PRICE,
  CATEGORY_NOT_FOUND: CATEGORY_NOT_FOUND,
  PRODUCT_TITLE_TAKEN: PRODUCT_TITLE_TAKEN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "WRITE_PRODUCT_FAILED",
    message: "Failed to write product data",
  }),
});

export const LIST_PRODUCTS_ERRORS = Object.freeze({
  CATEGORY_NOT_FOUND: CATEGORY_NOT_FOUND,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "LIST_PRODUCTS_FAILED",
    message: "Failed to read products data",
  }),
});

export const UPDATE_PRODUCT_ERRORS = Object.freeze({
  INVALID_PRICE: INVALID_PRICE,
  PRODUCT_NOT_FOUND: PRODUCT_NOT_FOUND,
  CATEGORY_NOT_FOUND: CATEGORY_NOT_FOUND,
  PRODUCT_TITLE_TAKEN: PRODUCT_TITLE_TAKEN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "UPDATE_PRODUCT_FAILED",
    message: "Failed to update product",
  }),
});

export const DELETE_PRODUCT_ERRORS = Object.freeze({
  PRODUCT_NOT_FOUND: PRODUCT_NOT_FOUND,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "DELETE_PRODUCT_FAILED",
    message: "Failed to delete product",
  }),
});
