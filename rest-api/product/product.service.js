import { ObjectId } from "mongodb";
import {
  getCollection,
  PRODUCTS_COLLECTION,
  CATEGORIES_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { rethrowDuplicate } from "#src/utils/index.js";

async function resolveCategoryId(categoryId) {
  if (!categoryId) return undefined;
  const categoriesCollection = await getCollection(CATEGORIES_COLLECTION);
  let objectId;
  try {
    objectId = new ObjectId(categoryId);
  } catch {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  const existing = await categoriesCollection.findOne({ _id: objectId });
  if (!existing) throw new Error("CATEGORY_NOT_FOUND");
  return existing._id;
}


export async function createProduct(product) {
  if (!product.price || Number(product.price) <= 0) throw new Error("INVALID_PRICE");
  let categoryId = product.categoryId;
  let doc;
  if (categoryId) {
    const resolvedId = await resolveCategoryId(categoryId);
    doc = { ...product, categoryId: resolvedId };
    categoryId = resolvedId;
  } else {
    doc = { ...product };
    delete doc.categoryId;
  }
  const collection = await getCollection(PRODUCTS_COLLECTION);
  try {
    const result = await collection.insertOne(doc);
    let response = { id: result.insertedId.toString(), ...doc };
    if (response.categoryId && typeof response.categoryId === "object" && response.categoryId.toString) {
      response.categoryId = response.categoryId.toString();
    }
    return response;
  } catch (err) {
    rethrowDuplicate(err, "PRODUCT_TITLE_TAKEN");
  }
}


export async function updateProduct(id, product) {
  if (!product.price || Number(product.price) <= 0) throw new Error("INVALID_PRICE");
  let categoryId = product.categoryId;
  let doc;
  if (categoryId) {
    const resolvedId = await resolveCategoryId(categoryId);
    doc = { ...product, categoryId: resolvedId };
    categoryId = resolvedId;
  } else {
    doc = { ...product };
    delete doc.categoryId;
  }
  const collection = await getCollection(PRODUCTS_COLLECTION);
  const result = await collection.replaceOne({ _id: new ObjectId(id) }, doc);
  if (result.matchedCount === 0) throw new Error("PRODUCT_NOT_FOUND");
  let response = { id, ...doc };
  if (response.categoryId && typeof response.categoryId === "object" && response.categoryId.toString) {
    response.categoryId = response.categoryId.toString();
  }
  return response;
}

export async function deleteProduct(id) {
  const collection = await getCollection(PRODUCTS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function listProducts({ filterBy }) {
  const collection = await getCollection(PRODUCTS_COLLECTION);
  const query = {};

  if (filterBy?.title) {
    query.title = { $regex: filterBy.title, $options: "i" };
  }

  if (filterBy?.price) {
    query.price = { $lte: Number(filterBy.price) };
  }

  if (filterBy?.categoryId) {
    query.categoryId = new ObjectId(filterBy.categoryId);
  }

  const products = await collection.find(query).toArray();
  return products.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
}
