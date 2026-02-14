import {
  writeHelloWorld,
  deleteHelloWorld,
  getHelloValue,
} from "./hello.service.js";
import { logError, logInfo } from "#src/log.service.js";

export async function getHello(req, res) {
  updateCallCookie(req, res, "getHello");
  try {
    const hello = await getHelloValue();
    res.json({ hello });
    logInfo(`Response get hello sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to read data.json: ${err?.message ?? err}`);
    res.status(500).json({
      message: "Failed to read data.json",
      code: "GET_HELLO_FAILED",
      details: err?.message,
    });
  }
}

export async function patchHello(req, res) {
  updateCallCookie(req, res, "patchHello");
  logInfo(req.body);

  try {
    await writeHelloWorld(req.body.hello);
    res.json({ message: req.body.hello });
    logInfo(`Response wrote hello world sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to write data.json: ${err?.message ?? err}`);
    res.status(500).json({
      message: "Failed to write data.json",
      code: "WRITE_HELLO_FAILED",
      details: err?.message,
    });
  }
}

export async function deleteHello(req, res) {
  updateCallCookie(req, res, "deleteHello");
  try {
    await deleteHelloWorld();
    res.json({ message: "Deleted hello world" });
    logInfo(`Response delete hello world sent with status ${res.statusCode}`);
  } catch (err) {
    logError(`Failed to delete from data.json: ${err?.message ?? err}`);
    res.status(500).json({
      message: "Failed to delete from data.json",
      code: "DELETE_HELLO_FAILED",
      details: err?.message,
    });
  }
}

function updateCallCookie(req, res, methodName) {
  const callerKey = buildCallerKey(req);
  const cookieName = `calls_${methodName}_${callerKey}`;
  const cookies = parseCookies(req);
  const prior = Number(cookies[cookieName] ?? 0);
  const count = Number.isFinite(prior) ? prior + 1 : 1;
  logInfo(`${cookieName}: count=${count}`);
  res.cookie(cookieName, String(count), { sameSite: "lax" });
}

function parseCookies(req) {
  const header = req?.headers?.cookie;
  if (!header) {
    return {};
  }

  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    const value = rawValue.join("=");
    acc[rawKey] = value;
    return acc;
  }, {});
}

function buildCallerKey(req) {
  const ip = normalizeIp(req.ip || req.connection?.remoteAddress || "unknown");
  const agent = req.headers?.["user-agent"] || "unknown";
  const raw = `${ip}_${agent}`.toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  logInfo(`ip: ${ip} safe:${safe}, raw: ${raw}`);

  return safe.slice(0, 200) || "unknown";
}

function normalizeIp(value) {
  if (value === "::1") {
    return "127.0.0.1";
  }
  if (value.startsWith("::ffff:")) {
    return value.replace("::ffff:", "");
  }
  return value;
}
