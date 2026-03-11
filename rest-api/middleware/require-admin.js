import { getUserByUsername } from "#src/rest-api/user/user.service.js";
import { requireLogin } from "./require-login.js";
import { warnAndRespond } from "#src/utils/index.js";
import MIDDLEWARE_ERROR_MAP from "./middleware.errormaps.js";
const { REQUIRED_ADMIN, ADMIN_AUTH_FAILED } = MIDDLEWARE_ERROR_MAP;

export async function requireAdmin(req, res, next) {
  requireLogin(req, res, async () => {
    try {
      const user = await getUserByUsername(req.user?.username);
      if (!user?.isAdmin) {
        warnAndRespond(res, REQUIRED_ADMIN);
        return;
      }
      next();
    } catch (err) {
      warnAndRespond(res, ADMIN_AUTH_FAILED, err);
    }
  });
}
