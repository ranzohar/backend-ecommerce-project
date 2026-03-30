import { logDebug } from "#src/log.service.js";
import {
  getCollection,
  USERS_COLLECTION,
  ORDER_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import {
  toObjectId,
  requiredArguments,
  rethrowDuplicate,
} from "#src/utils/index.js";

export async function addUser(user) {
  requiredArguments([user?.username, "username"], [user?._id, "userId"]);
  const usersCollection = await getCollection(USERS_COLLECTION);

  // Check if username already exists (case-insensitive)
  const existingUser = await getUserByUsername(user.username);
  if (existingUser) {
    throw new Error(`USERNAME_TAKEN: ${user.username}`);
  }

  try {
    const result = await usersCollection.insertOne(user);
    if (!result.acknowledged) {
      throw new Error("USER_CREATION_FAILED");
    }
  } catch (err) {
    logDebug(`Error inserting user: ${err.message}`);
    rethrowDuplicate(err, `USERNAME_TAKEN: ${user.username}`);
  }
  return user;
}

export async function removeUser(userId) {
  requiredArguments([userId, "userId"]);
  const usersCollection = await getCollection(USERS_COLLECTION);
  const objectId = toObjectId(userId);
  if (!objectId) {
    throw new Error("INVALID_USER_ID");
  }
  const result = await usersCollection.deleteOne({ _id: objectId });
  if (result.deletedCount === 0) {
    throw new Error("USER_NOT_FOUND");
  }
  return true;
}

export async function getUserByUsername(username) {
  const users = await getCollection(USERS_COLLECTION);
  if (!username) {
    return null;
  }

  return (
    (await users.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    })) ?? null
  );
}

export async function getUserById(userId) {
  requiredArguments([userId, "userId"]);
  const users = await getCollection(USERS_COLLECTION);
  const objectId = toObjectId(userId);
  if (!objectId) {
    return null;
  }

  return (await users.findOne({ _id: objectId })) ?? null;
}

export async function updateUserByUsername(username, updates) {
  const users = await getCollection(USERS_COLLECTION);

  const existing = await users.findOne(
    { username },
    { collation: { locale: "en", strength: 2 } },
  );
  if (!existing) {
    throw new Error("USER_NOT_FOUND");
  }
  logDebug(
    `Updating user: ${JSON.stringify(existing)} with updates: ${JSON.stringify(updates)}`,
  );
  try {
    const updated = await users.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { returnDocument: "after" },
    );
    const { hashedPassword, ...updatedWithoutPassword } = updated;
    console.log(
      "[DEBUG] Updated user (without password):",
      updatedWithoutPassword,
    );
    return updatedWithoutPassword;
  } catch (err) {
    rethrowDuplicate(err, "USERNAME_TAKEN");
  }
}

// export async function deleteUserByUsername(username) {
//   const users = await getCollection(USERS_COLLECTION);
//   const result = await users.deleteOne({ username: username });
//   return result.deletedCount > 0;
// }

export async function getUsers() {
  const users = await getCollection(USERS_COLLECTION);
  const pipeline = [
    {
      $lookup: {
        from: ORDER_COLLECTION,
        localField: "_id",
        foreignField: "_userId",
        as: "orders",
      },
    },
    {
      $project: {
        hashedPassword: 0,
        "orders._id": 0,
        "orders._userId": 0,
      },
    },
  ];
  return await users.aggregate(pipeline).toArray();
}
