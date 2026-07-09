const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://127.0.0.1:5000",
      "/outputs": "http://127.0.0.1:5000",
    },
  },
  build: {
    outDir: "dist",
  },
});
