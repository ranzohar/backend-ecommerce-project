import {
  getCollection,
  PRODUCTS_COLLECTION,
  CATEGORIES_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { rethrowDuplicate } from "#src/utils/index.js";

export async function upsertProduct(product) {
  const categoriesCollection = await getCollection(CATEGORIES_COLLECTION);

  const existingCategory = await categoriesCollection.findOne({
    name: product.category,
  });

  if (!existingCategory) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const collection = await getCollection(PRODUCTS_COLLECTION);

  try {
    await collection.updateOne(
      { title: product.title },
      [
        { $set: product },
        { $set: { categoryId: existingCategory._id } },
        { $unset: "category" },
      ],
      { upsert: true },
    );
  } catch (err) {
    rethrowDuplicate(err, "PRODUCT_TITLE_TAKEN");
  }

  return product;
}

export async function deleteProduct(productId) {
  const collection = await getCollection(PRODUCTS_COLLECTION);
  const result = await collection.deleteOne({ _id: productId });
  return result.deletedCount > 0;
}

export async function getProduct(productId) {
  const collection = await getCollection(PRODUCTS_COLLECTION);
  const product = await collection.findOne({ _id: productId });
  if (!product) {
    return null;
  }
  const { _id, ...rest } = product;
  return { id: _id, ...rest };
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

  if (filterBy?.category) {
    const categoriesCollection = await getCollection(CATEGORIES_COLLECTION);
    const existingCategory = await categoriesCollection.findOne({
      name: filterBy.category,
    });
    if (!existingCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    query.categoryId = existingCategory._id;
  }

  const products = await collection.find(query).toArray();
  return products.map(({ _id, ...rest }) => {
    return { id: _id, ...rest };
  });
}
