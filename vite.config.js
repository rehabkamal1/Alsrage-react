import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return "react-vendor";
          }
          if (/node_modules\/(chart\.js|react-chartjs-2)\//.test(id)) {
            return "charts";
          }
          if (/node_modules\/exceljs\//.test(id)) {
            return "exceljs";
          }
          if (/node_modules\/(jspdf|jspdf-autotable)\//.test(id)) {
            return "exports";
          }
          if (/node_modules\/(bootstrap|react-bootstrap)\//.test(id)) {
            return "ui";
          }
          return undefined;
        },
      },
    },
  },
});
