import Cryptr from "cryptr";
import bcrypt from "bcrypt";

import { requiredArguments } from "./utils/required-arguments.js";
import { logDebug } from "./log.service.js";

requiredArguments([process.env.CRYPTR_SECRET, "CRYPTR_SECRET"]);

const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

export function decryptToken(token) {
  if (!token) {
    return null;
  }
  return JSON.parse(cryptr.decrypt(token));
}

export function encryptToken(data) {
  logDebug(`Encrypting: ${JSON.stringify({ data })}`);
  return cryptr.encrypt(JSON.stringify(data));
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
