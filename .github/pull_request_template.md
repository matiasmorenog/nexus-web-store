## Qué cambia

-

## Branch

- [ ] Branch nuevo desde `development` (`feat/` / `fix/` / `refactor/` / `chore/` / `docs/`)
- [ ] Un solo objetivo por PR (sin mezclar tareas)
- [ ] Base del PR: **`development`** (no `main`)

## Tienda(s) afectada(s)

- [ ] Apparel (`demo-store`)
- [ ] Vape (`vape-demo`)
- [ ] Compartido (ambas)

## Cómo probar

- [ ] Local: `npm run dev:apparel` y/o `npm run dev:vape`
- [ ] Preview Vercel (links en checks del PR)

## Deploy

- PR a **`development`** → preview en Vercel (no producción).
- Release: PR **`development` → `main`** → producción en ambos proyectos Vercel.
