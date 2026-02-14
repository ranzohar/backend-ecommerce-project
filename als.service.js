import { AsyncLocalStorage } from "async_hooks";

let als = new AsyncLocalStorage();

export function getStore() {
  return als.getStore();
}

export function runAls(initialStore, callback) {
  als.run(initialStore, callback);
}

export function getUser() {
  const store = getStore();
  return store?.user;
}
