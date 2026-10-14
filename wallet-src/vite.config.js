import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* one ES module entry + lazy chunks in site/assets/privy/, loaded by site.js only when the wallet modal is used */
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production"), global: "globalThis" },
  build: {
    outDir: "../assets/privy",
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
    minify: "esbuild",
    modulePreload: false,
    rollupOptions: { input: "src/main.jsx", preserveEntrySignatures: "allow-extension", output: { format: "es", entryFileNames: "wallet.js", chunkFileNames: "[name]-[hash].js", assetFileNames: "[name]-[hash][extname]" } }
  }
});
