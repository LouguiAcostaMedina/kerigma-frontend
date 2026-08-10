# AGENTS.md - Frontend SGM

Guía de contexto para agentes de IA y desarrolladores que trabajen en `iglesia-frontend/`.

## Contexto

- SPA React 19 + Vite 7 + react-router-dom 7.
- Componentes en `src/components/`, páginas en `src/pages/`, hooks de datos en `src/hooks/`.
- La API se consume con axios (`withCredentials`) desde `src/services/api.js`.
- Los permisos se derivan del `role` del usuario (`src/constants/roles.js`).

## Comandos (ejecutar en `iglesia-frontend/`)

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # vite build
npm run lint     # eslint .  (debe quedar en 0 errores / 0 warnings)
npm run preview  # previsualizar build
```

## Reglas de oro

1. `npm run lint` debe pasar con **0 errores y 0 warnings**. No añadir `eslint-disable` sin justificación.
2. No usar `any` ni `@ts-ignore` (los archivos `.jsx` deben seguir las convenciones de ESLint del repo).
3. La URL base de la API se lee de `VITE_API_URL` (`src/constants/index.js`). No hardcodear rutas.
4. Antes de abrir un PR: `npm run lint` y `npm run build` deben pasar.
5. Los imports usan alias `@/` (configurado en Vite) o rutas relativas. No mezclar sin motivo.

## Convenciones

- Páginas: un componente por archivo, con su CSS Module `*.module.css`.
- Hooks de datos (`useMembers`, `useGroups`, etc.): centralizan el fetch, paginación, filtros
  y estado de modales. Las páginas consumen el estado y los setters.
- Errores de red: se muestran con `showNotification` (`src/utils/notifications.jsx`).

## Documentación

- `REGLAS.md` — reglas de codificación.
- `APIDOCUMENTATION.md` — endpoints usados y convenciones de la API.
- `README.md` — estructura, configuración y comandos.
