import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || "3000"),
  },
  publicDir: 'public',
  plugins: [
    devServer({
      entry: "src/index.ts",
    }),
  ],
});