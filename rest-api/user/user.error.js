import { HTTP_STATUS } from "#src/utils/index.js";

export const USERNAME_TAKEN = Object.freeze({
  status: HTTP_STATUS.CONFLICT,
  code: "USERNAME_TAKEN",
  message: "Username already exists",
});

export const USER_NOT_FOUND = Object.freeze({
  status: HTTP_STATUS.NOT_FOUND,
  code: "USER_NOT_FOUND",
  message: "User not found",
});

export const USER_ID_REQUIRED = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "USER_ID_REQUIRED",
  message: "User id is required",
});

export const USER_ID_INVALID = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "USER_ID_INVALID",
  message: "Invalid user id",
});

export const USERNAME_REQUIRED = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "USERNAME_REQUIRED",
  message: "Username is required",
});

export const REQUIRE_ADMIN = Object.freeze({
  status: HTTP_STATUS.FORBIDDEN,
  code: "REQUIRE_ADMIN",
  message: "Admin privileges required",
});

export const CURRENT_PASSWORD_REQUIRED = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "CURRENT_PASSWORD_REQUIRED",
  message: "Current password is required to change password",
});

export const INVALID_CURRENT_PASSWORD = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "INVALID_CURRENT_PASSWORD",
  message: "Current password is invalid",
});

export const EMPTY_USERNAME_NOT_ALLOWED = Object.freeze({
  status: HTTP_STATUS.BAD_REQUEST,
  code: "EMPTY_USERNAME_NOT_ALLOWED",
  message: "Username cannot be empty",
});

export const UPDATE_ERRORS = Object.freeze({
  USERNAME_TAKEN: USERNAME_TAKEN,
  USER_NOT_FOUND: USER_NOT_FOUND,
  USER_ID_REQUIRED: USER_ID_REQUIRED,
  USER_ID_INVALID: USER_ID_INVALID,
  CURRENT_PASSWORD_REQUIRED: CURRENT_PASSWORD_REQUIRED,
  INVALID_CURRENT_PASSWORD: INVALID_CURRENT_PASSWORD,
  EMPTY_USERNAME_NOT_ALLOWED: EMPTY_USERNAME_NOT_ALLOWED,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "UPDATE_USER_FAILED",
    message: "Failed to update user",
  }),
});

export const SIGNUP_ERRORS = Object.freeze({
  USERNAME_TAKEN: USERNAME_TAKEN,
  EMPTY_USERNAME_NOT_ALLOWED: EMPTY_USERNAME_NOT_ALLOWED,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "SIGNUP_FAILED",
    message: "Failed to create user",
  }),
});

export const LOGIN_ERRORS = Object.freeze({
  USERNAME_REQUIRED: USERNAME_REQUIRED,
  USER_NOT_FOUND: USER_NOT_FOUND,

  INVALID_USERNAME_OR_PASSWORD: Object.freeze({
    status: HTTP_STATUS.UNAUTHORIZED,
    code: "INVALID_USERNAME_OR_PASSWORD",
    message: "Invalid username or password",
  }),
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "LOGIN_FAILED",
    message: "Failed to login",
  }),
});

export const REMOVE_ERRORS = Object.freeze({
  USERNAME_REQUIRED: USERNAME_REQUIRED,
  USER_NOT_FOUND: USER_NOT_FOUND,
  REQUIRE_ADMIN: REQUIRE_ADMIN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "DELETE_USER_FAILED",
    message: "Failed to delete user",
  }),
});

export const ADD_USER_ERRORS = Object.freeze({
  USERNAME_TAKEN: USERNAME_TAKEN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "USER_CREATION_FAILED",
    message: "Failed to create user",
  }),
});

export const LIST_ERRORS = Object.freeze({
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "LIST_USERS_FAILED",
    message: "Failed to list users",
  }),
});
