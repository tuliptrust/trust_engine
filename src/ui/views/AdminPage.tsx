import type { Snapshot } from "../../entities/snapshot.js";
import { Layout } from "./Layout.js";

type AdminPageProps = {
  snapshots: Snapshot[];
  error?: string | null;
  message?: string | null;
};

export function AdminPage({ snapshots, error, message }: AdminPageProps) {
  return (
    <Layout title="TrustEngine Admin" stylesheet="/public/admin.css">
      <div class="page admin-page">
        <div
          id="snapshot-loading"
          class="loading-overlay"
          style="display: none"
        >
          <div class="loading-box">
            <div class="spinner" aria-hidden="true"></div>
            <p>Building snapshot… This may take a minute.</p>
          </div>
        </div>

        <header>
          <div>
            <h1>TrustEngine Admin</h1>
          </div>
          <div>
            <a href="/">View Shell</a> | <a href="/logout">Logout</a>
          </div>
        </header>

        {error && <div class="flash error">Error: {error}</div>}
        {message && <div class="flash success">{message}</div>}

        <section>
          <h2>Create Snapshot</h2>
          <form
            method="post"
            action="/admin/snapshots"
            onsubmit="const overlay = document.getElementById('snapshot-loading'); if (overlay) overlay.style.display = 'flex'; const btn = this.querySelector('button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }"
          >
            <label for="submitter">Submitter</label>
            <input
              id="submitter"
              name="submitter"
              placeholder="Your name or handle"
              required
            />

            <label for="gitRef">
              Git ref (branch / tag / commit, default: main)
            </label>
            <input id="gitRef" name="gitRef" placeholder="main" />

            <button type="submit">Create snapshot</button>
          </form>
        </section>

        {/* Existing snapshots table unchanged */}
        <section>
          <h2>Existing Snapshots</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Submitter</th>
                <th>Commit</th>
                <th>Git Ref</th>
                <th>Created</th>
                <th>Open</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr>
                  <td>{s.id}</td>
                  <td>{s.submitter}</td>
                  <td>{s.commitHash.slice(0, 7)}</td>
                  <td>{s.gitRef || "-"}</td>
                  <td>
                    {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td>
                    <a href={`/?commit=${s.commitHash}`} target="_blank">
                      Open
                    </a>
                  </td>
                  <td>
                    <form
                      method="post"
                      action={`/admin/snapshots/${s.id}/delete`}
                    >
                      <button
                        type="submit"
                        class="delete-button"
                        title="Delete snapshot"
                        onclick="return confirm('Delete this snapshot? This cannot be undone.')"
                      >
                        ×
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan={7}>No snapshots yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
