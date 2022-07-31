import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dotenv from "dotenv";
import path from "path";
const env = dotenv.config().parsed;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    "process.env": process.env,
  },
  css: ["@/assets/styles/tailwind.css"],
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
