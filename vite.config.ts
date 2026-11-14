import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" — относительные пути к ассетам. Вместе с HashRouter сайт работает
// на GitHub Pages по адресу username.github.io/<любое-имя-репозитория>/ без настройки.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5183, strictPort: true },
});
