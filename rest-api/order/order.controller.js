import { crudlSafe, pickFields, requiredArguments } from "#src/utils/index.js";
import { logDebug, logInfo } from "#src/log.service.js";
import { ADD_ORDER_ERRORS, GET_ORDERS_ERRORS } from "./order.error.js";
import { addOrder, getOrders, getOrdersByUser } from "./order.service.js";

const ORDER_FIELDS = ["price"];

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
