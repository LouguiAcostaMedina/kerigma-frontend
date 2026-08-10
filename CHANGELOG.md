# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Las fechas usan el formato YYYY-MM-DD.

## [Unreleased]

### Iniciativa de modernización — inicio (2026-08-09)

Arranca la iniciativa de modernización, endurecimiento y escalado del sistema. Esta rama
(`chore/baseline`) fija el punto de partida sobre el estado real del código.

#### Fase 0 — Preparación (completada)

- **Baseline**: se commitea el estado real del working tree en la rama `chore/baseline`
  (incluye el rebrand visual "Miel & Tinta", el refactor de componentes y los CSS Modules).
- **Suite de verificación (foto inicial)**: `npm run lint` con **0 errores / 0 warnings** y
  `npm run build` sin errores (544 módulos).
- **Entorno**: `.env` verificado — `VITE_API_URL` presente y consistente con
  `src/constants/index.js`. No se versiona el `.env`.
- **CI**: se agrega `.github/workflows/ci.yml` (lint + build) que corre en cada PR y push a `main`.
