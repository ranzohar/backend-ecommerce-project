// get-new-id.js
// Utility to generate a new unique ID (MongoDB ObjectId style)
import { randomBytes } from "crypto";

export function getNewId() {
  // 12 bytes = 24 hex chars, like MongoDB ObjectId
  return randomBytes(12).toString("hex");
}
