/** @type {import('prettier').Config} */
const config = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
  importOrder: [
    "^react$",
    "^next/(.*)$",
    "^@/(.*)$",
    "^@supabase/(.*)$",
    "^@trpc/(.*)$",
    "^@tanstack/(.*)$",
    "^@vercel/(.*)$",
    "^@t3-oss/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
