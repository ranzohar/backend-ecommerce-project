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
    message: "Failed to authorize admin",
    code: "ADMIN_AUTH_FAILED",
  },
  ALREADY_LOGGED_IN: {
    status: HTTP_STATUS.FORBIDDEN,
    message: "Action blocked for logged-in user",
    code: "ALREADY_LOGGED_IN",
  },
});

export default MIDDLEWARE_ERROR_MAP;
