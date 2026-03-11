import {
  getCollection,
  CATEGORIES_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { toObjectId, rethrowDuplicate } from "#src/utils/index.js";

export async function addCategory(name) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  try {
    const result = await collection.insertOne({ name });
    return { id: result.insertedId.toString(), name };
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
}

export async function updateCategory(categoryId, name) {
  const id = toObjectId(categoryId);
  if (!id) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  const collection = await getCollection(CATEGORIES_COLLECTION);
  try {
    const result = await collection.updateOne({ _id: id }, { $set: { name } });
    if (result.matchedCount === 0) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
  return { id: categoryId, name };
}

export async function deleteCategory(categoryId) {
  const id = toObjectId(categoryId);
  if (!id) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const result = await collection.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
}

export async function listCategories() {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const categories = await collection.find({}).toArray();
  return categories.map(({ _id, name }) => {
    return { id: _id.toString(), name };
  });
}
