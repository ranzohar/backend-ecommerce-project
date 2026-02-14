import { warnAndRespond } from "#src/utils/index.js";
import MIDDLEWARE_ERROR_MAP from "./middleware.errormaps.js";
const { ALREADY_LOGGED_IN } = MIDDLEWARE_ERROR_MAP;

export function requireGuest(req, res, next) {
  const token = req.cookies?.loginToken;
  if (token) {
    warnAndRespond(res, ALREADY_LOGGED_IN);
    return;
  }
  next();
}
