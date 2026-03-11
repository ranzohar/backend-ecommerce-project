import { HTTP_STATUS } from "#src/utils/index.js";

const MIDDLEWARE_ERROR_MAP = Object.freeze({
  MISSING_TOKEN: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: "Request blocked without login token",
    code: "LOGIN_REQUIRED",
  },
  INVALID_TOKEN: {
    status: HTTP_STATUS.UNAUTHORIZED,
    message: `Invalid login token`,
    code: "INVALID_TOKEN",
  },
  REQUIRED_ADMIN: {
    status: HTTP_STATUS.FORBIDDEN,
    message: "Admin access required",
    code: "ADMIN_REQUIRED",
  },
  ADMIN_AUTH_FAILED: {
    status: HTTP_STATUS.FORBIDDEN,
    message: "Unauthorized action",
    code: "UNAUTHORIZED_ACTION",
  },
  ALREADY_LOGGED_IN: {
    status: HTTP_STATUS.FORBIDDEN,
    message: "Action blocked for logged-in user",
    code: "ALREADY_LOGGED_IN",
  },
  ADMIN_NOT_ALLOWED: {
    status: HTTP_STATUS.FORBIDDEN,
    message: "Action not allowed for admin users",
    code: "ADMIN_NOT_ALLOWED",
  },
});

export default MIDDLEWARE_ERROR_MAP;
