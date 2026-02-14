import { readFile, writeFile } from "fs/promises";

export async function readJsonFile(filePath, defaultValue) {
  try {
    const raw = await readFile(filePath, "utf-8");
    if (!raw.trim()) {
      return defaultValue;
    }
    const data = JSON.parse(raw);
    return data ?? defaultValue;
  } catch (err) {
    if (err?.code === "ENOENT") {
      return defaultValue;
    }
    throw err;
  }
}

export async function writeJsonFile(filePath, data) {
  const payload = JSON.stringify(data, null, 2);
  await writeFile(filePath, payload, "utf-8");
}
