import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Desativa a regra base para evitar conflitos
      "no-unused-vars": "off",
      // Configura a regra específica do TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrors: "none", // Ignora variáveis de erro capturadas não utilizadas
        },
      ],
    },
  },
];

export default eslintConfig;
