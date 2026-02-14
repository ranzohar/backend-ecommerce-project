import { logDebug, logError } from "#src/log.service.js";
import {
  getCollection,
  ORDER_COLLECTION,
  USERS_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { requiredArguments } from "#src/utils/index.js";
import { getUserByUsername } from "#src/rest-api/user/user.service.js";

export async function addOrder(order, username) {
  logDebug(`Adding order: ${JSON.stringify(order)}`);
  requiredArguments([username, "username"]);
  const { _id } = await getUserByUsername(username);
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const result = await ordersCollection.insertOne({ ...order, _userId: _id });
  if (!result.acknowledged) {
    logError(
      `Failed to add order: ${JSON.stringify(order)}, result: ${JSON.stringify(result)}`,
    );
    throw new Error("ORDER_CREATION_FAILED");
  }
  return order;
}

export async function getOrdersByUser(username) {
  logDebug(`Getting orders for user: ${username}`);
  requiredArguments([username, "username"]);
  const { _id } = await getUserByUsername(username);
  const ordersCollection = await getCollection(ORDER_COLLECTION);
  const pipeline = [
    { $match: { _userId: _id } },
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
