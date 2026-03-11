import { getUserByUsername } from "#src/rest-api/user/user.service.js";
import { warnAndRespond } from "#src/utils/index.js";
import MIDDLEWARE_ERROR_MAP from "./middleware.errormaps.js";

const { ADMIN_NOT_ALLOWED, ADMIN_AUTH_FAILED } = MIDDLEWARE_ERROR_MAP;

export async function requireNonAdmin(req, res, next) {
  try {
    const user = await getUserByUsername(req.user?.username);
    if (user?.isAdmin) {
      warnAndRespond(res, ADMIN_NOT_ALLOWED);
      return;
    }
    next();
  } catch (err) {
    warnAndRespond(res, ADMIN_AUTH_FAILED, err);
  }
}
