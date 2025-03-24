import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Export a simplified config that can be serialized
export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Add any custom rules here
    },
    settings: {
      // Add any custom settings here
    }
  }
];
