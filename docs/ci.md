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

Hasta nuevo aviso, las **tres** tiendas usan Ignored Build Step con one-liner (o scripts espejo): **skip** Preview / PRs / `development` / feature branches; **build** solo si `VERCEL_ENV=production` o ref=`main` (release). Cómo reanudar: `DEPLOY.md` → “Reanudar previews (las 3 tiendas)”.

### Prioridad de checks en un PR

Orden práctico (mientras previews Vercel estén pausados):

1. **`lint-and-typecheck`** (GitHub Actions) — gate de código
2. Checks **`Vercel – *`** — **omitidos** (Ignored Build Step) hasta reanudar previews

No marcar los checks Vercel como required en branch protection: el Ignored Build Step saltea deploys a propósito y GitHub trataría el check faltante como bloqueante.

## Roadmap / tech debt

### Fase 1.5 — Lint + branch protection (hecho, NEX-11)

`npm run lint` = `eslint src --max-warnings=0`. Check `lint-and-typecheck` requerido en `development`. Ver `.cursor/rules/ci-todo.mdc`.

### Fase 2 — `npm run build` en CI (opcional, futuro)

**Pendiente para cuando la app esté en producción activa** y quieras un pipeline más estricto. Hoy el build en desarrollo lo cubre Vercel. Linear: NEX-7.

- Env dummy o secrets mínimos para `next build`
- Evaluar si alguna ruta consulta DB en build time
- No es prioridad mientras el producto siga en fase demo/desarrollo

### Fase 3 — Branch protection (hecho con NEX-11)

GitHub → `development` → Require status checks → **`lint-and-typecheck`**.

## Merge (agente / flujo ágil)

- `gh pr checks` → job `lint-and-typecheck` verde → pedir sí del usuario antes de merge.
- Mientras previews Vercel estén pausados, no esperar checks `Vercel – *` en PRs a `development`.