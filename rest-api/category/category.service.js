import {
  getCollection,
  CATEGORIES_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { rethrowDuplicate } from "#src/utils/index.js";

export async function addCategory(name) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  try {
    await collection.insertOne({ name });
    return { name };
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
}

export async function updateCategory(name, newName) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  try {
    const result = await collection.updateOne({ name }, { $set: { name: newName } });
    if (result.matchedCount === 0) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
  return { name: newName };
}

export async function deleteCategory(name) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const result = await collection.deleteOne({ name });
  if (result.deletedCount === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
}

export async function listCategories() {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const categories = await collection.find({}).toArray();
  return categories.map(({ name }) => ({ name }));
}
