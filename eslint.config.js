import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import daStyle from "eslint-config-dicodingacademy";
import vitest from "@vitest/eslint-plugin";
// import globals from "globals";

export default defineConfig([
  {
    plugins: {
      vitest,
    },
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
    },
  },

  daStyle,
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
      cammelcase: "off",
      "no-unused-vars": "off",
    },
  },
]);
