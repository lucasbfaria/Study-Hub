# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Wouter routing
- **Auth**: Cookie-based session auth (Node.js crypto scrypt for password hashing)

## Application: Studify

Studify is a study groups platform in Brazilian Portuguese with:
- User registration & login (session-based, cookie auth)
- Private study groups (invite-only)
- Invite system: admins invite by email, users accept/reject
- Study posts: subject, hours studied, optional description
- Weekly ranking by hours per group
- Streak tracking (consecutive study days)
- Dashboard: sidebar (groups) + center feed + right ranking panel
- User profile page with stats

### Demo Accounts (seeded)
- `ana@exemplo.com` / `senha123` (admin of "Maratona de Programação")
- `carlos@exemplo.com` / `senha123` (admin of "Concursos Públicos")
- `julia@exemplo.com` / `senha123`

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── studify/            # React Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Database seeder
```

## Database Schema

- `users` — id, name, email, passwordHash, streak, totalHours, lastStudyDate
- `groups` — id, name, adminId
- `group_members` — groupId, userId
- `posts` — groupId, userId, subject, hours, description
- `invites` — groupId, invitedById, invitedUserId, status (pending/accepted/rejected)
- `sessions` — sessionId, userId, expiresAt

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, cookie-parser, session middleware, routes at `/api`
- Routes: auth, groups, invites, users
- `pnpm --filter @workspace/api-server run dev` — run the dev server

### `artifacts/studify` (`@workspace/studify`)

React + Vite frontend for Studify.

- Pages: login, register, dashboard, group, profile, invites
- Components: layout (sidebar), modal, shared UI primitives
- Uses `@workspace/api-client-react` generated hooks
- `pnpm --filter @workspace/studify run dev` — run dev server

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/schema/users.ts`, `groups.ts`, `posts.ts`, `invites.ts`, `sessions.ts`
- `drizzle.config.ts` — Drizzle Kit config
- `pnpm --filter @workspace/db run push` — push schema to database

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`). Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `scripts` (`@workspace/scripts`)

- `pnpm --filter @workspace/scripts run seed` — seeds demo data
