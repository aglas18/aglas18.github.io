// @ts-check
import { defineConfig } from "astro/config";
import path from "path";

// https://astro.build/config
export default defineConfig({
  base: "/",
  output: "static",

  devToolbar: {
    enabled: false,
  },

  vite: {
    resolve: {
      alias: {
        // Makes ~/ point to the src directory
        '~/': `${path.resolve('./src')}/`,
      },
    },
  },
});
