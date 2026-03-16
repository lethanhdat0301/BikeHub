import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunks - split vendor and UI libraries
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@chakra-ui/react", "@chakra-ui/icons", "@emotion/react", "@emotion/styled"],
          "vendor-i18n": ["react-i18next", "i18next"],
        },
      },
    },
    // Increase chunk size warning limit to be more conservative
    chunkSizeWarningLimit: 1000,
  },
});
