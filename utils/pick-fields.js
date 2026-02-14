import { hashPassword } from "#src/crypt-service.js";

export async function pickFieldsWithPassword(input, fields) {
  if (!input || typeof input !== "object") {
    return {};
  }
  const output = {};

  for (const field of fields) {
    if (input[field] === undefined) {
      continue;
    }

    if (field === "password") {
      output.hashedPassword = await hashPassword(input[field]);
    } else {
      output[field] = input[field];
    }
  }
  return output;
}

export function pickFields(input, fields) {
  if (!input || typeof input !== "object") {
    return {};
  }
  const output = {};

  for (const field of fields) {
    if (input[field] === undefined) {
      continue;
    }
    output[field] = input[field];
  }
  return output;
}
