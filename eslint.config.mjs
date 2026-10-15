export default [
  {
    files: ["**/*.js", "**/*.mjs"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": "warn",
      "no-debugger": "warn",
      "no-constant-condition": "warn",
      "no-unreachable": "error",
    },
  },
];
