import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Lets us write JSX inside normal .js files (beginner friendly: App.js, index.js)
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  server: { port: 3000 },
});
