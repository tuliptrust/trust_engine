import { Hono } from "hono";
import { config } from "../config.js";
import { LoginPage } from "../ui/views/LoginPage.js";
import {
  establishAdminSession,
  clearAdminSession,
} from "../services/session_service.js";

const login = new Hono();

// GET /login – show login form
login.get("/login", (c) => {
  const error = c.req.query("error") ?? null;
  return c.html(<LoginPage error={error} />);
});

// POST /login – verify credentials, set session
login.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const username = String(body["username"] || "").trim();
  const password = String(body["password"] || "");

  if (username !== config.adminUser || password !== config.adminPassword) {
    return c.redirect(
      "/login?error=" + encodeURIComponent("Invalid username or password"),
    );
  }

  establishAdminSession(c);
  return c.redirect("/admin");
});

// GET /logout – clear session
login.get("/logout", (c) => {
  clearAdminSession(c);
  return c.redirect("/login");
});

export { login };
