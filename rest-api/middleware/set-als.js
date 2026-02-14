import { decryptToken } from "#src/crypt-service.js";
import { runAls } from "#src/als.service.js";

export function setAls(req, _res, next) {
  const session = decryptToken(req.cookies?.loginToken);
  if (session) {
    runAls({ user: session }, () => next());
  } else {
    next();
  }
}
