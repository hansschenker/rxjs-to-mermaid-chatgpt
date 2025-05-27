import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "rxjsToMermaid",
      fileName: "index",
    },
    rollupOptions: {
      external: ["rxjs", "typescript"],
      output: {
        globals: {
          rxjs: "rxjs",
        },
      },
    },
  },
  plugins: [dts()],
});
