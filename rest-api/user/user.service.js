import { logDebug } from "#src/log.service.js";
import {
  getCollection,
  USERS_COLLECTION as COLLECTION_NAME,
} from "#src/mongodb/mongodb.service.js";
import { toObjectId, requiredArguments } from "#src/utils/index.js";

async function verifyUsernameNotTaken(username, { excludeUserId } = {}) {
  const users = await getCollection(COLLECTION_NAME);
  if (!username) {
    return false;
  }

  const filter = {
    username: { $regex: `^${username}$`, $options: "i" },
  };

  if (excludeUserId) {
    const excludedId = toObjectId(excludeUserId);
    if (!excludedId) {
      return true;
    }
    filter._id = { $ne: excludedId };
  }

  const existingUser = await users.findOne(filter);
  if (existingUser) {
    throw new Error("USERNAME_TAKEN");
  }
}

export async function addUser(user) {
  requiredArguments([user?.username, "username"], [user?._id, "userId"]);
  const usersCollection = await getCollection(COLLECTION_NAME);
  await verifyUsernameNotTaken(user.username);
  const result = await usersCollection.insertOne(user);
  if (!result.acknowledged) {
    logError(
      `Failed to add user: ${JSON.stringify(user)}, result: ${JSON.stringify(result)}`,
    );
    throw new Error("USER_CREATION_FAILED");
  }
  return user;
}

export async function getUserByUsername(username) {
  const users = await getCollection(COLLECTION_NAME);
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
  const users = await getCollection(COLLECTION_NAME);
  const objectId = toObjectId(userId);
  if (!objectId) {
    return null;
  }

  return (await users.findOne({ _id: objectId })) ?? null;
}

export async function updateUserByUsername(username, updates) {
  const users = await getCollection(COLLECTION_NAME);

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
    await users.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { returnDocument: "after" },
    );
    const { hashedPassword, ...updatesWithoutPassword } = updates;
    return updatesWithoutPassword;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("USERNAME_TAKEN");
    }
    throw err;
  }
}

// export async function deleteUserByUsername(username) {
//   const users = await getCollection(COLLECTION_NAME);
//   const result = await users.deleteOne({ username: username });
//   return result.deletedCount > 0;
// }
