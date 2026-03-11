import { logDebug, logError } from "#src/log.service.js";
import {
  getCollection,
  ORDER_COLLECTION,
  USERS_COLLECTION,
  PRODUCTS_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { requiredArguments } from "#src/utils/index.js";
import { getUserByUsername } from "#src/rest-api/user/user.service.js";

export async function addOrder(order, username) {
  logDebug(`Adding order: ${JSON.stringify(order)}`);
  requiredArguments([username, "username"]);
  const { _id } = await getUserByUsername(username);

  const titles = order.products.map((p) => { return p.title; });
  const productsCollection = await getCollection(PRODUCTS_COLLECTION);
  const foundProducts = await productsCollection
    .find({ title: { $in: titles } })
    .toArray();

  const totalPrice = order.products.reduce((sum, { title, quantity }) => {
    const product = foundProducts.find((p) => { return p.title === title; });
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    return sum + product.price * quantity;
  }, 0);

  const productsToSave = order.products.map(({ title, quantity }) => {
    const product = foundProducts.find((p) => { return p.title === title; });
    return { _productId: product._id, quantity };
  });

  const orderToSave = { products: productsToSave, totalPrice };
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const result = await ordersCollection.insertOne({
    ...orderToSave,
    _userId: _id,
  });
  if (!result.acknowledged) {
    logError(
      `Failed to add order: ${JSON.stringify(order)}, result: ${JSON.stringify(result)}`,
    );
    throw new Error("ORDER_CREATION_FAILED");
  }
  return { products: order.products, totalPrice };
}

export async function getOrdersByUser(username) {
  logDebug(`Getting orders for user: ${username}`);
  requiredArguments([username, "username"]);
  const { _id } = await getUserByUsername(username);
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const pipeline = [
    { $match: { _userId: _id } },
    { $unwind: "$products" },
    {
      $lookup: {
        from: PRODUCTS_COLLECTION,
        localField: "products._productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $addFields: {
        "products.title": "$productDetails.title",
      },
    },
    {
      $project: {
        "products._productId": 0,
        productDetails: 0,
      },
    },
    {
      $group: {
        _id: "$_id",
        totalPrice: { $first: "$totalPrice" },
        products: {
          $push: { title: "$products.title", quantity: "$products.quantity" },
        },
      },
    },
    {
      $addFields: {
        createdAt: { $toDate: "$_id" },
        id: { $toString: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ];
  const orders = await ordersCollection.aggregate(pipeline).toArray();
  return orders;
}

export async function getOrders(sortBy) {
  const ordersCollection = await getCollection(ORDER_COLLECTION);

  let pipeline = [
    { $unwind: "$products" },
    {
      $lookup: {
        from: PRODUCTS_COLLECTION,
        localField: "products._productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $addFields: {
        "products.title": "$productDetails.title",
      },
    },
    {
      $project: {
        "products._productId": 0,
        productDetails: 0,
      },
    },
    {
      $group: {
        _id: "$_id",
        _userId: { $first: "$_userId" },
        totalPrice: { $first: "$totalPrice" },
        products: {
          $push: { title: "$products.title", quantity: "$products.quantity" },
        },
      },
    },
    {
      $lookup: {
        from: USERS_COLLECTION,
        localField: "_userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $addFields: {
        createdAt: { $toDate: "$_id" },
        id: { $toString: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        _userId: 0,
        "user._id": 0,
      },
    },
  ];

  switch (sortBy) {
    case "username":
      pipeline.push({
        $sort: { "user.username": 1 },
      });
      break;
    case "createdAt":
      break;
    default:
      logError(`Invalid sortBy value: ${sortBy}, defaulting to createdAt`);
      break;
  }
  return await ordersCollection.aggregate(pipeline).toArray();
}
