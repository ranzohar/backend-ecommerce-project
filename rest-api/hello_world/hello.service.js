import { readFile, writeFile } from "fs/promises";
import path from "path";

const dataFilePath = path.resolve(process.cwd(), "data", "data.json");

export async function writeHelloWorld(message) {
  const data = await readDataFile();
  data.hello = message;
  await writeToDataFile(data);
}

export async function deleteHelloWorld() {
  const data = await readDataFile();
  delete data.hello;
  await writeToDataFile(data);
}

export async function getHelloValue() {
  const data = await readDataFile();
  return data.hello;
}

async function readDataFile() {
  const raw = await readFile(dataFilePath, "utf-8");
  const data = JSON.parse(raw);
  return data;
}

async function writeToDataFile(data) {
  const payload = JSON.stringify(data, null, 2);
  await writeFile(dataFilePath, payload, "utf-8");
}
