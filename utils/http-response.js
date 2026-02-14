import { logWarn, logError } from "#src/log.service.js";
import { requiredArguments } from "#src/utils/index.js";

export const HTTP_STATUS = Object.freeze({
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
    // logError(`${message}: ${err.message}\nStack: ${err.stack}`);
    logArgs.push("\nStack:", err.stack);
  }
  logWarn(...logArgs, { stackOffset: 2 });
  return res.status(status).json({
    message,
    code,
  });
}
