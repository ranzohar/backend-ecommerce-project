import { warnAndRespond } from "#src/utils/index.js";
import MIDDLEWARE_ERROR_MAP from "./middleware.errormaps.js";
import { logDebug, logError } from "#src/log.service.js";
import { decryptToken } from "#src/crypt-service.js";

const { MISSING_TOKEN, INVALID_TOKEN } = MIDDLEWARE_ERROR_MAP;

export function requireLogin(req, res, next) {
  const token = req.cookies?.loginToken;
  if (!token) {
    warnAndRespond(res, MISSING_TOKEN);
    return;
  }
  try {
    const session = verifyTokenExists(token);
    req.user = session;
    next();
  } catch (err) {
    warnAndRespond(res, INVALID_TOKEN, err);
  }
}

function verifyTokenExists(token) {
  const session = decryptToken(token);
  logDebug(["Verifying session token", session]);
  if (!session?.username) {
    logError(`Failed to verify token for: ${JSON.stringify(session)}`);
    throw new Error("INVALID_TOKEN");
  }
  return session;
}
