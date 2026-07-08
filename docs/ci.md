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

## Roadmap / tech debt

### Fase 1.5 — Lint en verde (antes de branch protection)

Hay ~31 errores ESLint preexistentes. Corregirlos antes de exigir el check en merge. Ver `.cursor/rules/ci-todo.mdc`.

### Fase 2 — `npm run build` en CI (opcional, futuro)

**Pendiente para cuando la app esté en producción activa** y quieras un pipeline más estricto. Hoy el build en desarrollo lo cubre Vercel.

- Env dummy o secrets mínimos para `next build`
- Evaluar si alguna ruta consulta DB en build time
- No es prioridad mientras el producto siga en fase demo/desarrollo

### Fase 3 — Branch protection

GitHub → `development` → Require status checks → **`lint-and-typecheck`**.

Solo después de Fase 1.5.

## Merge (agente / flujo ágil)

- **Hoy:** mergear cuando `typecheck` pase; lint en CI puede fallar hasta Fase 1.5.
- **Tras Fase 3:** `gh pr checks` → job `lint-and-typecheck` verde → `gh pr merge --squash`.
