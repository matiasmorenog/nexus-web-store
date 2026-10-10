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
- [ ] App3 (`manoviva-italia`, tienda real)
- [ ] Compartido (todas)

## Cómo probar

- [ ] Local: `npm run dev:app1` / `dev:app2` / `dev:app3`

## Deploy

- PR a **`development`** (draft hasta que haga falta correr checks). Previews Vercel pausados.
- Release: PR **`development` → `main`** (merge commit) → producción en los 3 proyectos Vercel.
