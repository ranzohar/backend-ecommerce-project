import { getNewId } from "#src/mongodb/mongodb.service.js";

import {
  crudlSafe,
  requiredArguments,
  pickFieldsWithPassword,
  encryptToken,
  comparePassword,
  pickFields,
} from "#src/utils/index.js";

import {
  addUser,
  getUserByUsername,
  updateUserByUsername,
  getUsers,
  removeUser,
} from "./user.service.js";
import { logDebug, logInfo } from "#src/log.service.js";
import {
  UPDATE_ERRORS,
  SIGNUP_ERRORS,
  LOGIN_ERRORS,
  LIST_ERRORS,
} from "./user.error.js";

const USER_FIELDS = ["username", "password", "fname", "lname", "allowOthers"];
const ME_RESPONSE_FIELDS = ["username", "isAdmin", "uid", "fname", "lname", "allowOthers"];
const LOGIN_COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" };

export async function signup(req, res) {
  crudlSafe(res, SIGNUP_ERRORS, async () => {
    const userInput = await pickFieldsWithPassword(req.body, USER_FIELDS);
    userInput._id = getNewId();
    userInput.createDate = new Date();

    // Validate username is not empty
    if (!userInput.username || userInput.username.trim() === "") {
      throw new Error("EMPTY_USERNAME_NOT_ALLOWED");
    }

    // Validate fname and lname are not empty
    if (!userInput.fname || userInput.fname.trim() === "" || !userInput.lname || userInput.lname.trim() === "") {
      throw new Error("EMPTY_NAME_NOT_ALLOWED");
    }

    const createdUser = await addUser(userInput);
    try {
      const response = pickFields(createdUser, ME_RESPONSE_FIELDS);
      response.uid = createdUser._id;
      loginAndRepond(
        res,
        createdUser,
        response,
        `Added user: ${JSON.stringify(userInput, null, 2)}.`,
      );
    } catch (error) {
      // If login fails after user creation, remove the user
      await removeUser(createdUser._id);
      throw error;
    }
  });
}

export async function me(req, res) {
  crudlSafe(res, {}, async () => {
    const response = pickFields(req.user, ME_RESPONSE_FIELDS);
    response.uid = req.user._id;
    res.json(response);
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
    const existingUser = await validatePassword(userInput, password);
    const response = pickFields(existingUser, ME_RESPONSE_FIELDS);
    response.uid = existingUser._id;
    loginAndRepond(
      res,
      existingUser,
      response,
      `Login token issued for: ${JSON.stringify(existingUser, null, 2)}. code:${res.statusCode}`,
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

    // Validate username is not empty if provided
    if (userInput.username !== undefined && userInput.username.trim() === "") {
      throw new Error("EMPTY_USERNAME_NOT_ALLOWED");
    }

    // If updating password, require and verify current password
    if (userInput.password) {
      if (!req.body.currentPassword) {
        throw new Error("CURRENT_PASSWORD_REQUIRED");
      }
      const existingUser = await getUserByUsername(req.user.username);
      if (!(await comparePassword(req.body.currentPassword, existingUser.hashedPassword))) {
        throw new Error("INVALID_CURRENT_PASSWORD");
      }
    }

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

export async function list(req, res) {
  crudlSafe(res, LIST_ERRORS, async () => {
    const users = await getUsers();
    res.json({ users });
    logInfo(`Response list users sent with status ${res.statusCode}`);
  });
}

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
  return existingUser;
}
