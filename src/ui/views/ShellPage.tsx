import type { Snapshot } from "../../entities/snapshot.js";
import { Layout } from "./Layout.js";

type ShellPageProps = {
  snapshots: Snapshot[];
  currentSnapshot: Snapshot | undefined;
};

export function ShellPage({ snapshots, currentSnapshot }: ShellPageProps) {
  return (
    <Layout title="Tulip Trust Collective" stylesheet="/public/shell.css">
      <div className="shell">
        <header>
          <button id="menuToggle" aria-label="Open menu">
            ☰
          </button>
        </header>
        <div className="content">
          <aside id="menu" className="menu">
            <div className="menu-list">
              {snapshots.map((s) => (
                <a
                  key={s.id}
                  href={`/?id=${s.id}`}
                  className={
                    "snapshot-btn" +
                    (s.id === currentSnapshot?.id ? " current" : "")
                  }
                >
                  <div className="snapshot-title">
                    {s.label && s.label.length > 0
                      ? s.label
                      : `Snapshot #${s.id}`}
                  </div>
                  <div className="snapshot-meta">
                    by {s.submitter} &bull; {s.commitHash.slice(0, 7)} &bull;{" "}
                    {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </div>
                </a>
              ))}
              {snapshots.length === 0 && (
                <div className="snapshot-meta">
                  No snapshots yet. Visit <a href="/admin">admin</a> to create
                  one.
                </div>
              )}
            </div>
          </aside>
          <main className="main-view">
            {currentSnapshot ? (
              <iframe
                src={`/snapshots/${currentSnapshot.folder}/index.html`}
                title={`Snapshot ${currentSnapshot.id}`}
              />
            ) : (
              <div className="empty-state">
                No snapshot selected. Create one in <a href="/admin">admin</a>.
              </div>
            )}
          </main>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var toggle = document.getElementById('menuToggle');
              var menu = document.getElementById('menu');
              if (!toggle || !menu) return;
              toggle.addEventListener('click', function () {
                menu.classList.toggle('open');
              });
            })();
          `,
        }}
      />
    </Layout>
  );
}
