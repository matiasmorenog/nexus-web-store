> **PR base:** always `development`. Do not open feature/fix PRs against `main`.
> **Language:** PR title and body must be in **English**.

## Qué cambia

-

## Branch

- [ ] Branch nuevo desde `development` (`feat/` / `fix/` / `refactor/` / `chore/` / `docs/`)
- [ ] Un solo objetivo por PR (sin mezclar tareas)
- [ ] Base del PR: **`development`** (no `main`)

## Tienda(s) afectada(s)

- [ ] App1 (`demo-store`)
- [ ] App2 (`vape-demo`)
- [ ] Compartido (ambas)

## Cómo probar

- [ ] Local: `npm run dev:app1` y/o `npm run dev:app2`
- [ ] Preview Vercel (links en checks del PR)

## Deploy

- PR a **`development`** → preview en Vercel (no producción).
- Release: PR **`development` → `main`** → producción en ambos proyectos Vercel.
