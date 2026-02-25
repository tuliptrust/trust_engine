import type { Snapshot } from "../../entities/snapshot.js";

type ShellPageProps = {
  snapshots: Snapshot[];
  currentSnapshot: Snapshot | undefined;
};

export function ShellPage({ snapshots, currentSnapshot }: ShellPageProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Tulip Trust Collective</title>
      </head>
      <body>
        <div class="app">
          <header>
            <button id="menuToggle" aria-label="Open menu">
              ☰
            </button>
            <div class="brand">Tulip Trust Collective</div>
          </header>
          <div class="content">
            <aside id="sidebar" class="sidebar">
              <h3>Snapshots</h3>
              <div class="snapshot-list">
                {snapshots.map((s) => (
                  <a
                    href={`/?id=${s.id}`}
                    class={
                      "snapshot-btn" +
                      (s.id === currentSnapshot?.id ? " current" : "")
                    }
                    style={{
                      background:
                        s.id === currentSnapshot?.id
                          ? "linear-gradient(135deg, #f59e0b, #b45309)"
                          : undefined,
                    }}
                  >
                    <div class="snapshot-title">
                      {s.label && s.label.length > 0
                        ? s.label
                        : `Snapshot #${s.id}`}
                    </div>
                    <div class="snapshot-meta">
                      by {s.submitter} &bull; {s.commitHash.slice(0, 7)} &bull;{" "}
                      {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </div>
                  </a>
                ))}
                {snapshots.length === 0 && (
                  <div class="snapshot-meta">
                    No snapshots yet. Visit{" "}
                    <a href="/admin" style={{ color: "#fbbf24" }}>
                      admin
                    </a>{" "}
                    to create one.
                  </div>
                )}
              </div>
            </aside>
            <main class="main-view">
              {currentSnapshot ? (
                <iframe
                  src={`/snapshots/${currentSnapshot.folder}/index.html`}
                  title={`Snapshot ${currentSnapshot.id}`}
                />
              ) : (
                <div class="empty-state">
                  No snapshot selected. Create one in <a href="/admin">admin</a>
                  .
                </div>
              )}
            </main>
          </div>
        </div>
        <script>
          {`
            const toggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            if (toggle && sidebar) {
              toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
              });
            }
          `}
        </script>
      </body>
    </html>
  );
}
