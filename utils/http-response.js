import { logWarn, logError } from "#src/log.service.js";
import { requiredArguments } from "#src/utils/index.js";

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

export function warnAndRespond(res, { status, message, code }, err) {
  requiredArguments([status, "status"], [message, "message"], [code, "code"]);
  const logArgs = [`${message}${err?.message ? `: ${err?.message}` : ""}`];
  if (err?.stack) {
    logArgs.push("\nStack:", err.stack);
  }
  // Clear loginToken cookie for user-not-found or invalid-user errors
  const shouldLogout =
    [
      "USER_NOT_FOUND",
      "INVALID_USERNAME_OR_PASSWORD",
      "LOGIN_REQUIRED",
      "INVALID_TOKEN",
    ].includes(code) || /user.*not.*found/i.test(message);
  if (shouldLogout && res.clearCookie) {
    res.clearCookie("loginToken");
  }
  logWarn(...logArgs, { stackOffset: 2 });
  return res.status(status).json({
    message,
    code,
  });
}
