# CI — GitHub Actions

## Qué corre hoy (Fase 1)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

| Trigger | Branches |
|---------|----------|
| `pull_request` | `development`, `main` |
| `push` | `development`, `main` |

Job **`lint-and-typecheck`** (Ubuntu, Node 24):

1. `npm ci`
2. `npx prisma generate` (con `DATABASE_URL` / `DIRECT_URL` dummy — no conecta a Neon)
3. `npm run typecheck`
4. `npm run lint` (`eslint src`)

Local:

```bash
npm run typecheck
npm run lint
```

## Relación con Vercel

| Capa | Rol | Hoy |
|------|-----|-----|
| **GitHub Actions** | Calidad de código (`typecheck` + `lint`) en cada PR | Activo (Fase 1) |
| **Vercel Preview / Production** | `build` + deploy con env real | Activo — **único `next build` en el flujo** |

No se duplican: Actions valida el código rápido; Vercel valida que compile y despliegue. El *Ignored Build Step* puede omitir preview en algunos PRs; por eso Actions no depende de Vercel para types/lint.

### Previews pausados (×3); Production en `main` activo

Las **tres** tiendas deployan Production solo al mergear a git **`main`**. Gate en `vercel.json` (`git.deploymentEnabled`: `main` sí, `**` no) — sin deployment en PRs no hay checks `Vercel – *` engañosos. Ignored Build Step en el dashboard queda de respaldo. Cómo reanudar previews: `DEPLOY.md`.

### Prioridad de checks en un PR

1. **`lint-and-typecheck`** (GitHub Actions) — gate de código (required). En draft corre el aviso **`lint-and-typecheck (draft)`** (no-op) y el gate queda skipped; al pasar a ready corre el check real.
2. Checks **`Vercel – *`** — no deberían aparecer en PRs mientras `deploymentEnabled` limite a `main`.

No marcar checks Vercel como required en branch protection.

## Roadmap / tech debt

### Fase 1.5 — Lint + branch protection (hecho)

`npm run lint` = `eslint src --max-warnings=0`. Check `lint-and-typecheck` requerido en `development`. Ver `.cursor/rules/ci-todo.mdc`.

### Fase 2 — `npm run build` en CI (opcional, futuro)

**Pendiente para cuando la app esté en producción activa** y quieras un pipeline más estricto. Hoy el build en desarrollo lo cubre Vercel. Ver `TODO.md`.

- Env dummy o secrets mínimos para `next build`
- Evaluar si alguna ruta consulta DB en build time
- No es prioridad mientras el producto siga en fase demo/desarrollo

### Fase 3 — Branch protection (hecho)

GitHub → `development` → Require status checks → **`lint-and-typecheck`**.

## Merge (agente / flujo ágil)

- PRs se crean en **draft**: el job real no corre (ahorro de minutos). Aparece `lint-and-typecheck (draft)` (aviso no-op) — no es el gate. Al pasar a ready corre `lint-and-typecheck`.
- `gh pr checks` → job `lint-and-typecheck` verde → pedir sí del usuario antes de merge.
- No esperar checks `Vercel – *` en PRs (deploys solo en `main`).