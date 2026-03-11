import { ObjectId } from "mongodb";
import { requiredArguments } from "#src/utils/index.js";

export function toObjectId(value) {
  requiredArguments([value, "value"]);

  try {
    return new ObjectId(value);
  } catch {
    return null;
  }
}

export function rethrowDuplicate(err, errorCode) {
  if (err?.code === 11000) {
    throw new Error(errorCode);
  }
  throw err;
}
