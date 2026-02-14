import { appendFile, mkdir, readdir, unlink, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

import { getStore } from "./als.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.resolve(__dirname, "logs");
const logFilePath = path.join(logsDir, `run.log`);
export const initPromise = deleteOldLog().then(initializeLogs);
// Delete the old run.log file at server start
async function deleteOldLog() {
  try {
    await rm(logFilePath, { force: true });
  } catch {
    // Ignore if file does not exist
  }
}
const allowedLevels = new Set(["debug", "info", "warn", "error"]);
const logToConsole = process.env.LOG_TO_CONSOLE !== "false";

function logToFile(args, level = "info", options = {}) {
  let stackOffset = options.stackOffset || 0;
  // Use util.format for console-like formatting
  let message = util.format(...args);
  const callerLocation = getCallerLocation(stackOffset + 1); // +1 for logToFile itself
  const store = getStore();
  if (store) {
    const user = store.user;
    message = `${message} [username:${user.username}]`;
    console.log(message);
  }
  const line = formatLogLine(message, level, callerLocation);
  if (logToConsole) {
    writeLogToConsole(line, level);
  }
  initPromise
    .then(() => {
      return mkdir(logsDir, { recursive: true });
    })
    .then(() => appendFile(logFilePath, line, "utf-8"))
    .catch((err) => {
      console.log(err);
    });
}

export function logDebug(...args) {
  let options = {};
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    args[args.length - 1] !== null &&
    !Array.isArray(args[args.length - 1]) &&
    Object.prototype.hasOwnProperty.call(args[args.length - 1], "stackOffset")
  ) {
    options = args.pop();
  }
  logToFile(args, "debug", options);
}

export function logInfo(...args) {
  let options = {};
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    args[args.length - 1] !== null &&
    !Array.isArray(args[args.length - 1]) &&
    Object.prototype.hasOwnProperty.call(args[args.length - 1], "stackOffset")
  ) {
    options = args.pop();
  }
  logToFile(args, "info", options);
}

export function logWarn(...args) {
  let options = {};
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    args[args.length - 1] !== null &&
    !Array.isArray(args[args.length - 1]) &&
    Object.prototype.hasOwnProperty.call(args[args.length - 1], "stackOffset")
  ) {
    options = args.pop();
  }
  logToFile(args, "warn", options);
}

export function logError(...args) {
  let options = {};
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    args[args.length - 1] !== null &&
    !Array.isArray(args[args.length - 1]) &&
    Object.prototype.hasOwnProperty.call(args[args.length - 1], "stackOffset")
  ) {
    options = args.pop();
  }
  logToFile(args, "error", options);
}

function formatLogLine(message, level, callerLocation) {
  const safeLevel = normalizeLevel(level);
  const timestamp = new Date().toISOString();
  let text = message;
  if (typeof message !== "string") {
    try {
      text = JSON.stringify(message);
    } catch {
      text = String(message);
    }
  }
  const location = callerLocation ? ` [${callerLocation}]` : "";
  return `[${timestamp}] [${safeLevel}] ${text}${location}\n`;
}

function normalizeLevel(level) {
  const candidate = typeof level === "string" ? level.toLowerCase() : "info";
  return allowedLevels.has(candidate) ? candidate : "info";
}

function writeLogToConsole(line, level) {
  const safeLevel = normalizeLevel(level);
  if (safeLevel === "error") {
    console.error(line.trimEnd());
    return;
  }
  if (safeLevel === "warn") {
    console.warn(line.trimEnd());
    return;
  }
  console.log(line.trimEnd());
}

function getCallerLocation() {
  const error = new Error();
  const stack = typeof error.stack === "string" ? error.stack.split("\n") : [];
  const currentFile = __filename.replace(/\\/g, "/");
  for (const line of stack) {
    const match =
      line.match(/\((.*):(\d+):(\d+)\)$/) || line.match(/at (.*):(\d+):(\d+)$/);
    if (!match) {
      continue;
    }
    const rawPath = match[1];
    if (
      rawPath.startsWith("node:internal") ||
      rawPath.startsWith("internal/")
    ) {
      continue;
    }
    let filePath = rawPath.replace(/\\/g, "/");
    if (filePath.startsWith("file:")) {
      try {
        filePath = fileURLToPath(filePath).replace(/\\/g, "/");
      } catch {
        filePath = filePath.replace(/^file:\/*/i, "/");
      }
    }
    if (filePath !== currentFile) {
      const relativePath = path
        .relative(process.cwd(), filePath)
        .replace(/\\/g, "/");
      return `${relativePath}:${match[2]}:${match[3]}`;
    }
  }
  return "";
}

async function initializeLogs() {
  try {
    const entries = await readdir(logsDir, { withFileTypes: true });
    const deletions = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => name !== "run.log" && name.endsWith(".log"))
      .map((name) => unlink(path.join(logsDir, name)));
    await Promise.all(deletions);
  } catch {
    // Ignore missing logs directory or delete errors.
  }
}
