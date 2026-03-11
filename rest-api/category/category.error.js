import { HTTP_STATUS } from "#src/utils/index.js";

export const CATEGORY_NOT_FOUND = Object.freeze({
  status: HTTP_STATUS.NOT_FOUND,
  code: "CATEGORY_NOT_FOUND",
  message: "Category not found",
});

export const CATEGORY_NAME_TAKEN = Object.freeze({
  status: HTTP_STATUS.CONFLICT,
  code: "CATEGORY_NAME_TAKEN",
  message: "Category name already exists",
});

export const ADD_ERRORS = Object.freeze({
  CATEGORY_NAME_TAKEN: CATEGORY_NAME_TAKEN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "ADD_CATEGORY_FAILED",
    message: "Failed to add category",
  }),
});

export const UPDATE_ERRORS = Object.freeze({
  CATEGORY_NOT_FOUND: CATEGORY_NOT_FOUND,
  CATEGORY_NAME_TAKEN: CATEGORY_NAME_TAKEN,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "UPDATE_CATEGORY_FAILED",
    message: "Failed to update category",
  }),
});

export const DELETE_ERRORS = Object.freeze({
  CATEGORY_NOT_FOUND: CATEGORY_NOT_FOUND,
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "DELETE_CATEGORY_FAILED",
    message: "Failed to delete category",
  }),
});

export const LIST_ERRORS = Object.freeze({
  DEFAULT: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: "LIST_CATEGORIES_FAILED",
    message: "Failed to list categories",
  }),
});
