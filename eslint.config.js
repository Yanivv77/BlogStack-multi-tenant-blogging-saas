import pluginJs from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import pluginImport from "eslint-plugin-import";
import pluginPrettier from "eslint-plugin-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // Base configurations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Next.js configuration
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "unused-imports": pluginUnusedImports,
      import: pluginImport,
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      unicorn: pluginUnicorn,
      prettier: pluginPrettier,
    },
    settings: {
      next: {
        rootDir: ".",
      },
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      },
    },
    rules: {
      // Include Next.js core-web-vitals rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // Next.js specific rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-unwanted-polyfillio": "error",
      "@next/next/no-duplicate-head": "error",

      // Allow require() calls
      "no-restricted-syntax": ["off"],
      "@typescript-eslint/no-var-requires": "off",

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/no-unescaped-entities": "off", // Allow apostrophes in text
      "react/prop-types": "off", // Not needed with TypeScript
      "react/jsx-key": "error", // Enforce key prop in iterators
      "react/jsx-no-duplicate-props": "error", // No duplicate props
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }], // Consistent JSX syntax
      "react/self-closing-comp": "error", // Self-close empty components

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error", // Enforce Rules of Hooks
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies

      // Import rules
      "import/no-unresolved": "off", // TypeScript handles this
      "import/first": "error", // Imports first
      "import/no-duplicates": "error", // No duplicate imports
      "import/order": "off", // Handled by Prettier plugin
      "import/newline-after-import": "error", // Newline after imports
      "import/no-cycle": "warn", // Prevent circular dependencies
      "import/extensions": ["error", "ignorePackages", {
        "js": "never",
        "mjs": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }],

      // Unicorn rules (modern JavaScript practices)
      "unicorn/prefer-node-protocol": "error", // Use node: protocol
      "unicorn/no-null": "off", // Allow null
      "unicorn/no-array-reduce": "off", // Allow reduce
      "unicorn/prefer-module": "error", // Prefer ESM
      "unicorn/filename-case": ["error", { cases: { kebabCase: true, pascalCase: true } }], // Consistent file naming
      "unicorn/prevent-abbreviations": "off", // Allow common abbreviations

      // Prettier integration
      "prettier/prettier": "warn", // Show prettier errors as warnings

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "off", // Turned off in favor of unused-imports/no-unused-vars
      "@typescript-eslint/no-explicit-any": [
        "warn",
        {
          fixToUnknown: true,
          ignoreRestArgs: false,
        },
      ],
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-non-null-assertion": "warn", // Warn on non-null assertions
      "@typescript-eslint/explicit-module-boundary-types": "off", // Not needed with type inference
      "@typescript-eslint/ban-ts-comment": ["warn", { "ts-ignore": "allow-with-description" }], // Require descriptions for ts-ignore

      // Node.js rules
      "node/no-process-env": "off",
      "node/no-unsupported-features/es-syntax": "off",
      "node/no-missing-import": "off",

      // Other rules
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      "prefer-const": "error", // Use const when possible
      "no-nested-ternary": "warn", // Avoid nested ternaries
      "no-unneeded-ternary": "error", // Avoid unnecessary ternaries
      "no-param-reassign": ["warn", { props: false }], // Don't reassign function parameters
      "no-duplicate-imports": "off", // Handled by import/no-duplicates
      "no-use-before-define": "off", // TypeScript handles this better
      "no-warning-comments": "off", // Allow TODO and FIXME comments
      semi: ["error"],
      quotes: ["error", "double"],
      "no-useless-escape": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-var": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // JSON files configuration
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: "jsonc-eslint-parser",
    },
    rules: {
      "no-unused-expressions": "off",
      "semi": "off",
      "quotes": "off",
      "comma-dangle": "off",
    },
  },

  // Override for test files
  {
    files: ["**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}", "**/tests/**/*.{js,ts,jsx,tsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];
