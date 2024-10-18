import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    define: {
      'import.meta.env.VITE_THIRDWEB_CLIENT_ID': JSON.stringify(env.VITE_THIRDWEB_CLIENT_ID),
    },
    optimizeDeps: {
      include: ['thirdweb/react', 'thirdweb'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    build: {
      target: 'es2020',
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
});
