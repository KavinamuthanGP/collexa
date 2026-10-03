import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),

    // 🔥 ENABLE PWA ONLY IN PRODUCTION
    mode === "production" &&
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico"],
        manifest: {
          name: "Collexa",
          short_name: "Collexa",
          description: "University Event Management Platform",
          theme_color: "#1a3a6b",
          background_color: "#f5f7fa",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ],
        },

        workbox: {
          navigateFallback: "/index.html", // ✅ important fix
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "firestore-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 300
                },
              },
            },
          ],
        },

        devOptions: {
          enabled: false, // ❌ CRITICAL FIX
        },
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));