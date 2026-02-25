import { Hono } from "hono";
import { shell } from "./shell.js";
import { admin } from "./admin.js";

const routes = new Hono();

routes.route("/", shell);
routes.route("/admin", admin);

export { routes };