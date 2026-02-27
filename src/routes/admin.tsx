import { Hono } from "hono";
import { AppDataSource } from "../data/data_source.js";
import { Snapshot } from "../entities/snapshot.js";
import { createSnapshot } from "../services/snapshot_builder.js";
import { AdminPage } from "../ui/views/AdminPage.js";
import { isAdminAuthenticated } from "../services/session_service.js";

const admin = new Hono();

// Require admin auth for all /admin routes
admin.use(async (c, next) => {
  if (!isAdminAuthenticated(c)) {
    return c.redirect("/login");
  }
  return next();
});

admin.get("/", async (c) => {
  const snapshotRepo = AppDataSource.getRepository(Snapshot);
  const snapshots = await snapshotRepo.find({
    order: { createdAt: "DESC" },
  });

  const error = c.req.query("error") ?? null;
  const message = c.req.query("message") ?? null;

  return c.html(
    <AdminPage snapshots={snapshots} error={error} message={message} />,
  );
});

admin.post("/snapshots", async (c) => {
  try {
    const body = await c.req.parseBody();
    const submitter = String(body["submitter"] || "").trim();
    const gitRef = String(body["gitRef"] || "").trim() || "main";

    if (!submitter) {
      return c.redirect(
        "/admin?error=" + encodeURIComponent("Submitter required"),
      );
    }

    const snapshot = await createSnapshot({ submitter, gitRef });

    return c.redirect(
      "/admin?message=" +
        encodeURIComponent(
          `Snapshot #${snapshot.id} created at ${snapshot.commitHash.slice(
            0,
            7,
          )}`,
        ),
    );
  } catch (err) {
    console.error(err);
    const msg =
      err instanceof Error ? err.message : "Unknown error creating snapshot";
    return c.redirect("/admin?error=" + encodeURIComponent(msg));
  }
});

export { admin };
