# Next.js Stack Template

A modern, full-stack Next.js template with TypeScript, tRPC, Prisma, Tailwind CSS, ESLint (flat config), and Prettier.

> Based on the [T3 Stack](https://create.t3.gg/). Thanks to the T3 team for their great work and docs.

## Features

- ⚡️ Next.js 15 (App Router)
- 🔥 TypeScript
- 🎨 Tailwind CSS v4 + PostCSS
- 🔐 tRPC 11 + React Query 5
- 📦 Prisma 6
- 🧹 ESLint 9 (flat config via ESLint CLI) + Prettier
- 🚀 Turbo dev mode

## Requirements

- Node 20 (LTS) or 22. Repo includes `.nvmrc` with `20`.
- npm (see `packageManager` in `package.json`).

## Getting Started

### Use this template (recommended)

1. Click “Use this template” on GitHub and create your new repo
2. Clone it locally
3. Ensure Node matches `.nvmrc`:
   ```bash
   nvm use
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Copy envs and configure:
   ```bash
   cp .env.example .env
   # fill values (e.g. DATABASE_URL)
   ```
6. Initialize database:
   ```bash
   npm run db:gen
   npm run db:push   # or: npm run db:migrate
   ```
7. Start dev server:
   ```bash
   npm run dev
   ```

### One-off copy without git history

```bash
npx degit 2nspired/next-stack my-new-app
cd my-new-app
npm i
git init && git add -A && git commit -m "init from next-stack template"
```

## Environment Variables

Copy `.env.example` → `.env` and set values such as:

```env
DATABASE_URL="your-database-url"
```

## Scripts

- `dev` - Start dev server (Turbo)
- `build` - Production build
- `start` - Start production server
- `preview` - Build then start
- `lint` - ESLint via CLI (flat config)
- `lint:fix` - ESLint with auto-fix
- `format:check` - Prettier check
- `format:write` - Prettier write
- `typecheck` - TypeScript type checking
- `check` - `eslint . && tsc --noEmit`
- `db:gen` - `prisma generate`
- `db:push` - Push schema to DB
- `db:migrate` - Deploy migrations
- `db:studio` - Prisma Studio

## Project Structure

```
├── src/app/         # Next.js app directory
├── src/server/      # tRPC server & procedures
├── prisma/          # Prisma schema & migrations
└── src/components/  # React components
```

## Notes

- Linting: Uses ESLint 9 flat config (`eslint.config.js`) with Next ignores. Type-aware TS rules are scoped to `*.ts/tsx` only.
- Styling: Tailwind v4 via `@tailwindcss/postcss` plugin in `postcss.config.js`.
- Node: `.nvmrc` pins Node 20; `package.json#engines` enforces `>=20 <23`.

## Customization

1. Update name, description, and repo URLs in `package.json`
2. Edit `prisma/schema.prisma` and run `npm run db:gen && npm run db:push`
3. Tweak branding/metadata in `src/app/(main)/layout.tsx`, icons, and fonts
4. Update tRPC routers under `src/server/api/routers/`

## License

MIT
