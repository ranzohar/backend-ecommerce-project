import path from "path";
import { readJsonFile, writeJsonFile } from "#src/utils/index.js";

const dataFilePath = path.resolve(process.cwd(), "data/products", "data.json");

export async function upsertProduct(productId, product) {
  const products = await readJsonFile(dataFilePath, {});
  products[productId] = product;
  await writeJsonFile(dataFilePath, products);
  return products[productId];
}

export async function deleteProduct(productId) {
  const products = await readJsonFile(dataFilePath, {});
  const existed = Object.prototype.hasOwnProperty.call(products, productId);
  if (existed) {
    delete products[productId];
    await writeJsonFile(dataFilePath, products);
  }
  return existed;
}

export async function getProduct(productId) {
  const products = await readJsonFile(dataFilePath, {});
  return products[productId] ?? null;
}

export async function listProducts({ filterBy }) {
  const products = await readJsonFile(dataFilePath, {});
  if (filterBy?.title) {
    var filtered = Object.fromEntries(
      Object.entries(products).filter(([, product]) => {
        return product?.title === filterBy.title;
      }),
    );
  }
  return filtered;
}
