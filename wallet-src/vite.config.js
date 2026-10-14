import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* one ES module entry + lazy chunks in site/assets/privy/, loaded by site.js only when the wallet modal is used */
/* One click from our modal straight into the wallet. Privy 3.49 has two gaps here:
   1. connectWallet() drops the preSelectedWalletId option before it reaches the connect view;
   2. the view tries the pre-selected wallet once, on mount, before its wallet list has loaded.
   So the user saw a one-item Privy list and picked the wallet twice. Patch both at build time. */
const preselectFix = {
  name: "privy-preselect-fix",
  transform(code, id){
    if (id.includes("index-CjVDJsPq")){
      const a = "description:e?.description,hideHeader:e?.hideHeader}";
      if (!code.includes(a)) { this.warn("privy connectWallet patch target not found"); return null; }
      return code.replace(a, "description:e?.description,hideHeader:e?.hideHeader,preSelectedWalletId:e?.preSelectedWalletId}");
    }
    if (!id.includes("ConnectWalletView-")) return null;
    const from = "s((()=>{if(!W)return;let e=ge.find((({id:e})=>e===W));e&&Se(e).catch(console.error)}),[W])";
    if (!code.includes(from)) { this.warn("privy preselect patch target not found"); return null; }
    return code.replace(from, "s((()=>{if(!W||ue||se)return;let e=ge.find((({id:e})=>e===W));e&&Se(e).catch(console.error)}),[W,ge.length])");
  }
};

export default defineConfig({
  plugins: [react(), preselectFix],
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
