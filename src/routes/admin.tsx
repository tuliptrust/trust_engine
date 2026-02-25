import { Hono } from "hono";
import { AppDataSource } from "../data/data_source.js";
import { Snapshot } from "../entities/snapshot.js";
import { createSnapshot } from "../services/snapshot_builder.js";

const admin = new Hono();

admin.get("/", async (c) => {
  const snapshotRepo = AppDataSource.getRepository(Snapshot);
  const snapshots = await snapshotRepo.find({
    order: { createdAt: "DESC" },
  });

  const error = c.req.query("error");
  const message = c.req.query("message");

  return c.html(
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>TrustEngine Admin </title>
      </head>
      <body>
        <div class="page">
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1>TrustEngine Admin </h1>
            </div>
            <div>
              <a href="/"> View Shell </a>
            </div>
          </header>

          {error && <div class="flash error"> Error: {error} </div>}
          {message && <div class="flash success"> {message} </div>}

          <section>
            <h2>Create Snapshot </h2>
            <form method="post" action="/admin/snapshots">
              <label for="submitter"> Submitter </label>
              <input
                id="submitter"
                name="submitter"
                placeholder="Your name or handle"
                required
              />

              <label for="label"> Label(optional) </label>
              <input
                id="label"
                name="label"
                placeholder="e.g. first snapshot, UI experiment, etc."
              />

              <label for="gitRef">
                {" "}
                Git ref(branch / tag / commit, default: main){" "}
              </label>
              <input id="gitRef" name="gitRef" placeholder="main" />

              <button type="submit"> Create snapshot </button>
            </form>
          </section>

          <section>
            <h2>Existing Snapshots </h2>
            <table>
              <thead>
                <tr>
                  <th>ID </th>
                  <th> Label </th>
                  <th> Submitter </th>
                  <th> Commit </th>
                  <th> Git Ref </th>
                  <th> Created </th>
                  <th> Open </th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr>
                    <td>{s.id} </td>
                    <td> {s.label || "-"} </td>
                    <td> {s.submitter} </td>
                    <td> {s.commitHash.slice(0, 7)} </td>
                    <td> {s.gitRef || "-"} </td>
                    <td>
                      {" "}
                      {s.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}{" "}
                    </td>
                    <td>
                      <a href={`/?id=${s.id}`} target="_blank">
                        {" "}
                        Open{" "}
                      </a>
                    </td>
                  </tr>
                ))}
                {snapshots.length === 0 && (
                  <tr>
                    <td colSpan={7}> No snapshots yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </body>
    </html>,
  );
});

admin.post("/snapshots", async (c) => {
  try {
    const body = await c.req.parseBody();
    const submitter = String(body["submitter"] || "").trim();
    const label = String(body["label"] || "").trim();
    const gitRef = String(body["gitRef"] || "").trim() || "main";

    if (!submitter) {
      return c.redirect(
        "/admin?error=" + encodeURIComponent("Submitter required"),
      );
    }

    const snapshot = await createSnapshot({ submitter, label, gitRef });

    return c.redirect(
      "/admin?message=" +
        encodeURIComponent(
          `Snapshot #${snapshot.id} created at ${snapshot.commitHash.slice(0, 7)}`,
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
