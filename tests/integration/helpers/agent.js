import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";

export function createAgent() {
  const app = createApp();
  const agent = request.agent(app);

  async function loginAs(username, password) {
    await agent.post("/api/user/login").send({ username, password });
  }

  async function logout() {
    await agent.post("/api/user/logout");
  }

  return { agent, loginAs, logout };
}
