import { Hono } from "hono";
import { shell } from "./shell.js";
import { admin } from "./admin.js";
import { login } from "./login.js";

const routes = new Hono();

routes.route("/", shell);
routes.route("/", login);
routes.route("/admin", admin);

export { routes };