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
