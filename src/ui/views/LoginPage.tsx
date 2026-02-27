import { Layout } from "./Layout.js";

type LoginPageProps = {
  error?: string | null;
};

export function LoginPage({ error }: LoginPageProps) {
  return (
    <Layout title="🌷">
      <div class="page login-page">
        <header>
          <h1>🌷</h1>
        </header>

        {error && <div class="flash error">Error: {error}</div>}

        <section>
          <form method="post" action="/login">
            <label for="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
            />

            <label for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />

            <button type="submit">Log in</button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
