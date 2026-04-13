import { ObjectId } from "mongodb";
import {
  getCollection,
  CATEGORIES_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { rethrowDuplicate } from "#src/utils/index.js";

export async function addCategory(name) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  try {
    const result = await collection.insertOne({ name });
    return { id: result.insertedId.toString(), name };
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
}

export async function updateCategory(id, newName) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  console.log("Updating category", id, newName);
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: newName } },
    );
    if (result.matchedCount === 0) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  } catch (err) {
    rethrowDuplicate(err, "CATEGORY_NAME_TAKEN");
  }
  return { id, name: newName };
}

export async function deleteCategory(id) {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
}

export async function listCategories() {
  const collection = await getCollection(CATEGORIES_COLLECTION);
  const categories = await collection.find({}).toArray();
  return categories.map(({ _id, name }) => ({ id: _id.toString(), name }));
}
