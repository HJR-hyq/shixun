# AGENTS.md

## Quick start

```bash
corepack enable
pnpm install
pnpm dev           # starts all apps via turbo-run
```

## Required tools

- Node >= 20.10.0 (pinned to 20.14.0 in `.node-version`)
- pnpm >= 9.12.0 (enforced via `preinstall` script — no npm/yarn)
- corepack must be enabled

## Monorepo structure

pnpm workspace with Turborepo. Key directories:

- `apps/` — deployable apps (web-antd, web-ele, web-naive, backend-mock)
- `packages/` — shared libraries (effects, @core, utils, types, stores, etc.)
- `internal/` — build tooling (vite-config, tailwind-config, lint-configs, tsconfig)
- `scripts/` — dev tooling (vsh CLI, turbo-run, clean, deploy)

Each app under `apps/` has its own `vite.config.mts`, `tailwind.config.mjs`, `tsconfig.json`, and `.env*` files.

## Key commands

| Task | Command |
| --- | --- |
| Dev (all apps) | `pnpm dev` |
| Dev (single app) | `pnpm dev:antd`, `pnpm dev:ele`, `pnpm dev:naive`, `pnpm dev:play` |
| Build (all) | `pnpm build` |
| Build (single app) | `pnpm build:antd`, `pnpm build:ele`, `pnpm build:naive`, `pnpm build:play` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Typecheck | `pnpm check:type` (runs `turbo run typecheck`) |
| Unit tests | `pnpm test:unit` (vitest, happy-dom environment) |
| Circular deps | `pnpm check:circular` |
| Dep check | `pnpm check:dep` |
| Spell check | `pnpm check:cspell` |
| Full check | `pnpm check` (circular + dep + type + cspell) |
| Reinstall | `pnpm reinstall` (deletes lockfile + reinstalls) |

## Verification order

Run `pnpm lint` → `pnpm check:type` → `pnpm test:unit` before pushing.

## Code style

- Prettier for formatting, ESLint for linting, Stylelint for CSS
- `.lintstagedrc.mjs` applies prettier + eslint on `*.{js,jsx,ts,tsx}` and prettier + stylelint on `*.{vue,css,scss}`
- ESLint config: flat config at root `eslint.config.mjs`, uses `@vben/eslint-config`
- Tailwind CSS v3 with config at `internal/tailwind-config/src/index.ts`
- ESM only (`"type": "module"` in root package.json)
- 2-space indentation, LF line endings

## Commit conventions

Angular-style commits enforced by commitlint + husky:

```
feat(scope): description
fix(scope): description
```

Pre-commit hook runs `vsh code-workspace --auto-commit` then `lint-staged`. Commit-msg hook runs `commitlint --edit`.

## Testing

- Unit: vitest with happy-dom, config at root `vitest.config.ts`
- E2e: Playwright (`pnpm test:e2e`, turbo task)
- Run single test file: `pnpm vitest run path/to/file.test.ts`
- Tests are excluded from `**/e2e/**` in vitest config

## Build notes

- `pnpm build` uses `cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build`
- Turborepo handles task ordering (`^build` means build dependencies first)
- `postinstall` runs `pnpm -r run stub --if-present` to stub packages

## Gotchas

- `pnpm dev` uses `turbo-run` (custom script in `scripts/turbo-run`), not raw turbo
- `vsh` is a custom CLI in `scripts/vsh` for lint, circular-dep checks, workspace updates
- `pnpm format` runs `vsh lint --format`, not raw prettier
- Three UI variants exist: Ant Design Vue, Element Plus, Naive UI — changes may need to land in all three
- The `packages/@core/` directory is the internal core layer; `packages/effects/` depends on it
- `backend-mock` uses Nitro (not Vite) — its build outputs `.nitro/` and `.output/`

## 业务 API

- Swagger 文档: http://gxcah.com:8077/swagger/index.html
- 认证方式: Bearer JWT Token
- 登录: POST /v1/auth/login → `{ username, password }`
- 用户信息: GET /v1/auth/userinfo
- 权限码: POST /v1/auth/codes
- 登出: POST /v1/auth/Logout
- 菜单: GET /v1/Menu2/getmenubystaff
