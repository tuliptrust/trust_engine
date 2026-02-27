import { Hono } from "hono";
import { Snapshot } from "../entities/snapshot.js";
import { AppDataSource } from "../data/data_source.js";
import { ShellPage } from "../ui/views/ShellPage.js";

const shell = new Hono();

shell.get("/", async (c) => {
  const snapshotRepo = AppDataSource.getRepository(Snapshot);
  const snapshots = await snapshotRepo.find({
    order: { createdAt: "DESC" },
  });

  const commitParam = c.req.query("commit");
  const currentSnapshot =
    (commitParam && snapshots.find((s) => s.commitHash === commitParam)) ||
    snapshots[0];

  return c.html(
    <ShellPage snapshots={snapshots} currentSnapshot={currentSnapshot} />,
  );
});

export { shell };
