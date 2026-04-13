import { logDebug, logError } from "#src/log.service.js";
import {
  getCollection,
  ORDER_COLLECTION,
  PUBLIC_ORDERS_COLLECTION,
  USERS_COLLECTION,
  PRODUCTS_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { requiredArguments } from "#src/utils/index.js";
import { getUserByUsername } from "#src/rest-api/user/user.service.js";

export async function addOrder(order, username) {
  logDebug(`Adding order: ${JSON.stringify(order)}`);
  requiredArguments([username, "username"]);
  const user = await getUserByUsername(username);
  if (!user) throw new Error("USER_NOT_FOUND");
  const { _id, allowOthersToSeeMyOrders } = user;

  const titles = order.products.map((p) => {
    return p.title;
  });
  const productsCollection = await getCollection(PRODUCTS_COLLECTION);
  const foundProducts = await productsCollection
    .find({ title: { $in: titles } })
    .toArray();

  const totalPrice = order.products.reduce((sum, { title, quantity }) => {
    const product = foundProducts.find((p) => {
      return p.title === title;
    });
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    return sum + product.price * quantity;
  }, 0);

  const productsToSave = order.products.map(({ title, quantity }) => {
    const product = foundProducts.find((p) => {
      return p.title === title;
    });
    return { _productId: product._id, quantity };
  });

  const orderToSave = { products: productsToSave, totalPrice };
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const result = await ordersCollection.insertOne({
    ...orderToSave,
    _userId: _id,
    public: allowOthersToSeeMyOrders,
  });
  if (!result.acknowledged) {
    logError(
      `Failed to add order: ${JSON.stringify(order)}, result: ${JSON.stringify(result)}`,
    );
    throw new Error("ORDER_CREATION_FAILED");
  }
  if (allowOthersToSeeMyOrders) {
    const publicOrdersCollection = await getCollection(
      PUBLIC_ORDERS_COLLECTION,
    );
    for (const { title, quantity } of order.products) {
      await publicOrdersCollection.updateOne(
        { title },
        { $inc: { totalQuantity: quantity } },
        { upsert: true },
      );
    }
  }
  return { products: order.products, totalPrice };
}

export async function getOrdersByUser(username) {
  logDebug(`Getting orders for user: ${username}`);
  requiredArguments([username, "username"]);
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  const { _id } = user;
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
        date: { $toDate: "$_id" },
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
  console.log(
    `[DEBUG] Found orders for user ${username}: ${JSON.stringify(orders)}`,
  );
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
        date: { $toDate: "$_id" },
        id: { $toString: "$_id" },
        userId: { $toString: "$_userId" },
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

function buildStatsPipeline() {
  return [
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
      $group: {
        _id: "$productDetails.title",
        totalQuantity: { $sum: "$products.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        title: "$_id",
        totalQuantity: 1,
      },
    },
  ];
}

function toStatsObject(results) {
  return results.reduce((acc, { title, totalQuantity }) => {
    acc[title] = totalQuantity;
    return acc;
  }, {});
}

export async function getStats() {
  logDebug("Getting product stats for all orders");
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const results = await ordersCollection
    .aggregate(buildStatsPipeline())
    .toArray();
  return toStatsObject(results);
}

export async function getStatsByUser(username) {
  logDebug(`Getting product stats for user: ${username}`);
  requiredArguments([username, "username"]);
  const { _id } = await getUserByUsername(username);
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const pipeline = [{ $match: { _userId: _id } }, ...buildStatsPipeline()];
  const results = await ordersCollection.aggregate(pipeline).toArray();
  return toStatsObject(results);
}

export async function getProductStats() {
  logDebug("Getting product stats with colors");
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const pipeline = [
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
      $group: {
        _id: "$productDetails.title",
        value: { $sum: "$products.quantity" },
        color: { $first: "$productDetails.color" },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1,
        color: 1,
      },
    },
  ];
  return ordersCollection.aggregate(pipeline).toArray();
}

export async function getOrdersByProduct(title) {
  logDebug(`Getting orders for product: ${title}`);
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const pipeline = [
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
    { $match: { "productDetails.title": title } },
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
      $project: {
        _id: 1,
        fname: "$user.fname",
        quantity: "$products.quantity",
      },
    },
    { $sort: { _id: 1 } },
  ];
  const results = await ordersCollection.aggregate(pipeline).toArray();
  return results.map(({ _id, fname, quantity }) => {
    const date = _id.getTimestamp();
    const timestamp = date.getTime();
    return [fname ?? "Unknown", quantity, date, timestamp];
  });
}

export async function getPublicOrders() {
  const publicOrdersCollection = await getCollection(PUBLIC_ORDERS_COLLECTION);
  const entries = await publicOrdersCollection.find({}).toArray();
  return entries.reduce((acc, { title, totalQuantity }) => {
    acc[title] = totalQuantity;
    return acc;
  }, {});
}

export async function revokePublicOrders(username) {
  const user = await getUserByUsername(username);
  if (!user) throw new Error("USER_NOT_FOUND");

  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const publicUserOrders = await ordersCollection
    .find({ _userId: user._id, public: true })
    .toArray();

  if (publicUserOrders.length === 0) return;

  const productsCollection = await getCollection(PRODUCTS_COLLECTION);
  const publicOrdersCollection = await getCollection(PUBLIC_ORDERS_COLLECTION);

  for (const order of publicUserOrders) {
    for (const { _productId, quantity } of order.products) {
      const product = await productsCollection.findOne({ _id: _productId });
      if (product) {
        await publicOrdersCollection.updateOne(
          { title: product.title },
          { $inc: { totalQuantity: -quantity } },
        );
      }
    }
  }

  const orderIds = publicUserOrders.map((o) => o._id);
  await ordersCollection.updateMany(
    { _id: { $in: orderIds } },
    { $set: { public: false } },
  );
}
