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

### Builds pausados (Goat + Vaporx)

Hasta nuevo aviso, **`goat-indumentaria`** y **`vaporx-store`** tienen Ignored Build Step = `exit 0` (y scripts repo siempre skip). **No hay Preview ni Production builds** en esas dos. **`manoviva-store` sigue buildando.** Cómo reanudar: ver `DEPLOY.md` → “Reanudar builds (Goat / Vaporx)”.

### Prioridad de checks en un PR

Orden práctico (mientras Goat/Vaporx estén pausados, el único preview Vercel esperado es Manoviva):

1. **`lint-and-typecheck`** (GitHub Actions) — gate de código
2. **`Vercel – manoviva-store`** (app3) — preview activo
3. **`Vercel – goat-indumentaria`** / **`vaporx-store`** — **omitidos** (paused) hasta nuevo aviso

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

- `gh pr checks` → job `lint-and-typecheck` verde → `gh pr merge --squash`.
- Preferir verde en **`Vercel – goat-indumentaria`** antes del merge; **`vaporx-store`** no bloquea salvo cambios específicos de app2.