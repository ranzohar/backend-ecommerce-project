import { getNewId } from "#src/mongodb/mongodb.service.js";

import {
  crudlSafe,
  requiredArguments,
  pickFieldsWithPassword,
  encryptToken,
  comparePassword,
} from "#src/utils/index.js";

import {
  addUser,
  getUserByUsername,
  updateUserByUsername,
} from "./user.service.js";
import { logDebug, logError, logInfo } from "#src/log.service.js";
import {
  UPDATE_ERRORS,
  SIGNUP_ERRORS,
  LOGIN_ERRORS,
  // REMOVE_ERRORS,
} from "./user.error.js";

const USER_FIELDS = ["username", "password"];
const LOGIN_COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" };

export async function signup(req, res) {
  crudlSafe(res, SIGNUP_ERRORS, async () => {
    const userInput = await pickFieldsWithPassword(req.body, USER_FIELDS);
    userInput._id = getNewId();

    const createdUser = await addUser(userInput);
    loginAndRepond(
      res,
      createdUser,
      { username: userInput.username },
      `Added user: ${JSON.stringify(userInput, null, 2)}.`,
    );
  });
}

export async function login(req, res) {
  crudlSafe(res, LOGIN_ERRORS, async () => {
    logDebug(`Login attempt for: ${req.body?.username}`);
    requiredArguments(
      [req.body?.username, "username"],
      [req.body?.password, "password"],
    );
    const password = req.body.password;
    const userInput = await pickFieldsWithPassword(req.body, USER_FIELDS);
    await validatePassword(userInput, password);
    loginAndRepond(
      res,
      userInput,
      { message: "Logged in" },
      `Login token issued for: ${JSON.stringify(userInput, null, 2)}. code:${res.statusCode}`,
    );
  });
}

export async function logout(req, res) {
  res.clearCookie("loginToken", LOGIN_COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
  logInfo(`${req.user.username} logged out with status ${res.statusCode}`);
}

export async function update(req, res) {
  crudlSafe(res, UPDATE_ERRORS, async () => {
    const userInput = await pickFieldsWithPassword(req.body, USER_FIELDS);
    const updatedUser = await updateUserByUsername(
      req.user?.username,
      userInput,
    );

    loginAndRepond(
      res,
      updatedUser,
      { updatedUser },
      `Response updated user sent with status ${res.statusCode}`,
    );
  });
}

// export async function remove(req, res) {
//   crudlSafe(res, REMOVE_ERRORS, async () => {
//     const username = req.body?.username;
//     if (!username) {
//       throw new Error("USERNAME_REQUIRED");
//     }

//     const user = await getUserByUsername(username);
//     if (user?.isAdmin) {
//       throw new Error("REQUIRE_ADMIN");
//     }

//     const deleted = await deleteUserByUsername(username);
//     if (!deleted) {
//       throw new Error("USER_NOT_FOUND");
//     }

//     res.json({ message: "Deleted user" });
//     logInfo(`Response delete user sent with status ${res.statusCode}`);
//   });
// }

function loginAndRepond(res, user, responsePayload, logMessage) {
  issueLoginCookie(res, user);
  res.json(responsePayload);
  logInfo(logMessage);
}

function issueLoginCookie(res, user) {
  res.cookie("loginToken", encryptToken(user), LOGIN_COOKIE_OPTIONS);
}

async function validatePassword(user, password) {
  logDebug(`Validating password for user: ${user.username}`);
  const existingUser = await getUserByUsername(user.username);
  if (!existingUser) {
    throw new Error("INVALID_USERNAME_OR_PASSWORD");
  }
  logDebug(
    `Comparing password for user: ${JSON.stringify(user)} and existing user: ${JSON.stringify(existingUser)}`,
  );
  if (!(await comparePassword(password, existingUser.hashedPassword))) {
    throw new Error("INVALID_USERNAME_OR_PASSWORD");
  }
}
