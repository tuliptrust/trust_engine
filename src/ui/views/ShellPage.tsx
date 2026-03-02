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
            <img src="/public/hamberger.svg" alt="" />
          </button>
        </header>
        <div className="content">
          <aside id="menu" className="menu">
            <div className="menu-list">
              {snapshots.map((s, i) => (
                <a
                  key={s.commitHash}
                  href={`/?commit=${s.commitHash}`}
                  className={
                    "snapshot-btn" +
                    (s.commitHash === currentSnapshot?.commitHash
                      ? " current"
                      : "")
                  }
                  style={{ padding: `1rem ${1 + i}rem` }}
                >
                  <div className="snapshot-title">
                    {s.commitHash.slice(0, 7)}
                  </div>
                  <div className="snapshot-meta">by {s.submitter}</div>
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
                title={`Snapshot ${currentSnapshot.commitHash.slice(0, 7)}`}
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

            // Toggle menu when clicking the button
            toggle.addEventListener('click', function () {
              menu.classList.toggle('open');
            });

            // Close menu when clicking on blank space (the overlay background)
            menu.addEventListener('click', function (event) {
              // Only close if the click is directly on the <aside id="menu">,
              // not on any of its children (like the menu items).
              if (event.target === menu) {
                menu.classList.remove('open');
              }
            });
          })();
        `,
        }}
      />
    </Layout>
  );
}
