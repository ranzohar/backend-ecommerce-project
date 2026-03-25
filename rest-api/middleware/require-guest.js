import { warnAndRespond } from "#src/utils/index.js";
import MIDDLEWARE_ERROR_MAP from "./middleware.errormaps.js";
import { logDebug } from "#src/log.service.js";
import { decryptToken } from "#src/crypt-service.js";

const { ALREADY_LOGGED_IN } = MIDDLEWARE_ERROR_MAP;

export function requireGuest(req, res, next) {
  const token = req.cookies?.loginToken;
  if (!token) {
    next();
    return;
  }
  try {
    const session = decryptToken(token);
    if (session?.username) {
      // Valid token, user is logged in
      warnAndRespond(res, ALREADY_LOGGED_IN);
      return;
    }
  } catch (err) {
    // Invalid token, clear it and allow
    res.clearCookie("loginToken");
    logDebug("Cleared invalid token cookie");
  }
  next();
}
