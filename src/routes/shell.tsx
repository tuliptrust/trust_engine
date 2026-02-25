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

  const idParam = c.req.query("id");
  const currentId = idParam ? Number(idParam) : snapshots[0]?.id;
  const currentSnapshot = snapshots.find((s) => s.id === currentId);

  return c.html(
    <ShellPage snapshots={snapshots} currentSnapshot={currentSnapshot} />,
  );
});

export { shell };
