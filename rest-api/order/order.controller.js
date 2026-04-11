import { crudlSafe, pickFields, requiredArguments } from "#src/utils/index.js";
import { logDebug, logInfo } from "#src/log.service.js";
import { ADD_ORDER_ERRORS, GET_ORDERS_ERRORS, GET_STATS_ERRORS } from "./order.error.js";
import { addOrder, getOrders, getOrdersByUser, getStats, getStatsByUser, getStatsByProduct, getProductStats } from "./order.service.js";

const ORDER_FIELDS = ["products"];

export async function add(req, res) {
  crudlSafe(res, ADD_ORDER_ERRORS, async () => {
    requiredArguments(
      [req.body, "request body"],
      [req.user?.username, "username from session"],
    );
    logDebug(
      `Received add order request with body: ${JSON.stringify(req.body)}`,
    );
    const orderInput = pickFields(req.body, ORDER_FIELDS);
    const createdOrder = await addOrder(orderInput, req.user.username);
    res.json(createdOrder);
    logInfo(`Added order: ${JSON.stringify(orderInput, null, 2)}.`);
  });
}

export async function get(req, res) {
  crudlSafe(res, GET_ORDERS_ERRORS, async () => {
    return res.json(await getOrdersByUser(req.user.username));
  });
}

export async function getAll(req, res) {
  crudlSafe(res, GET_ORDERS_ERRORS, async () => {
    logDebug(
      `Received get all orders request with query: ${JSON.stringify(req.query)}`,
    );
    return res.json(await getOrders(req.query.sortBy ?? "createdAt"));
  });
}

export async function stats(req, res) {
  crudlSafe(res, GET_STATS_ERRORS, async () => {
    return res.json(await getStats());
  });
}

export async function statsByUser(req, res) {
  crudlSafe(res, GET_STATS_ERRORS, async () => {
    return res.json(await getStatsByUser(req.params.username));
  });
}

export async function statsByProduct(req, res) {
  crudlSafe(res, GET_STATS_ERRORS, async () => {
    return res.json(await getStatsByProduct(req.params.title, req.user.isAdmin));
  });
}

export async function productStats(req, res) {
  crudlSafe(res, GET_STATS_ERRORS, async () => {
    return res.json(await getProductStats());
  });
}
