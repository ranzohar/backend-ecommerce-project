import { USER_NOT_FOUND } from "#src/rest-api/user/user.error.js";
import { HTTP_STATUS } from "#src/utils/http-response.js";

export const PRODUCT_NOT_FOUND = Object.freeze({
  status: HTTP_STATUS.NOT_FOUND,
  code: "PRODUCT_NOT_FOUND",
  message: "Product not found",
});

export const ADD_ORDER_ERRORS = Object.freeze({
  USER_NOT_FOUND: {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: "USER_NOT_FOUND",
    message: "User not found",
  },
  PRODUCT_NOT_FOUND: PRODUCT_NOT_FOUND,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "ADD_ORDER_FAILED",
    message: "Failed to create order",
  }),
});

export const GET_ORDERS_ERRORS = Object.freeze({
  USER_NOT_FOUND: {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: "USER_NOT_FOUND",
    message: "User not found",
  },
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "GET_ORDERS_FAILED",
    message: "Failed to retrieve orders",
  }),
});

export const GET_STATS_ERRORS = Object.freeze({
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "GET_STATS_FAILED",
    message: "Failed to retrieve stats",
  }),
});
