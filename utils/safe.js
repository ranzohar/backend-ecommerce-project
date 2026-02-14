import { warnAndRespond } from "#src/utils/index.js";

export async function crudlSafe(res, errorMap, cb) {
  try {
    await cb();
  } catch (err) {
    warnAndRespond(res, errorMap[err?.message] ?? errorMap.DEFAULT, err);
  }
}
