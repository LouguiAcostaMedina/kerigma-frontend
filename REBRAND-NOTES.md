# Rebrand «Miel & Tinta» — Notas de implementación

Documento de cierre del rebrand visual de `iglesia-frontend/`. Sustituye los tres lenguajes
visuales previos (navy/índigo, azul Escuela Sabática `#003366`, grises heredados) por un único
sistema de tokens de color, tipográfico y espacial, con modo oscuro y claro conmutable.

## Paleta

Un único eje cromático: **miel** (dorado amielado) sobre **tinta** (marrones cálidos).

### Oscuro (por defecto)

| Token | Valor |
| --- | --- |
| `--color-bg` | `#14110b` |
| `--color-surface` | `#1d1911` |
| `--color-surface-alt` | `#262019` |
| `--color-text` | `#f3ece0` |
| `--color-text-muted` | `#c2b6a1` |
| `--color-text-secondary` | `#968b76` |
| `--color-border` | `#3a3123` |
| `--color-border-soft` | `#2b251b` |
| `--color-accent` | `#e2a63f` |
| `--color-accent-hover` | `#edb452` |
| `--color-accent-soft` | `rgba(226, 166, 63, .16)` |
| `--color-accent-ring` | `rgba(226, 166, 63, .45)` |
| `--color-on-accent` | `#1a1305` |
| `--color-overlay` | `rgba(0, 0, 0, .55)` |

### Claro

| Token | Valor |
| --- | --- |
| `--color-bg` | `#faf6ef` |
| `--color-surface` | `#ffffff` |
| `--color-surface-alt` | `#f3ecdf` |
| `--color-text` | `#2a2114` |
| `--color-text-muted` | `#6f6553` |
| `--color-text-secondary` | `#857a67` |
| `--color-border` | `#e2d8c4` |
| `--color-border-soft` | `#ece4d3` |
| `--color-accent` | `#92400e` |
| `--color-accent-hover` | `#a34911` |
| `--color-on-accent` | `#ffffff` |

### Semánticos (dark / light)

| Token | Dark | Light |
| --- | --- | --- |
| `--color-danger` | `#f87171` | `#dc2626` |
| `--color-success` | `#34d399` | `#15803d` |
| `--color-warning` | `#fbbf24` | `#b45309` |
| `--color-info` | `#60a5fa` | `#2563eb` |

Cada semántico define además su `-soft` (fondo suave) y `--color-on-*` (texto sobre fondo lleno).

### Navegación (tinta, fija en ambos temas)

`--color-nav-bg` `#1a1409` (dark) / `#241b0c` (light), `--color-nav-text` `#f3ece0`,
`--color-nav-accent` `#e2a63f`, `--color-nav-accent-soft` `rgba(226, 166, 63, .18)`,
`--color-nav-on-accent` `#1a1305`. Se eliminó el degradado navy y el gris neutro del sidebar.

### Tags decorativos (etiquetas de entidad)

- `--color-tag-members`: dark `#60a5fa` / light `#2563eb`
- `--color-tag-groups`: dark `#34d399` / light `#15803d`
- `--color-tag-students`: dark `#c084fc` / light `#9333ea`
- `--color-tag-churches`: dark `#fb923c` / light `#c2410c`

## Tipografía

- `--font-sans`: Noto Sans (Google Fonts). Uso general: cuerpo, inputs, botones.
- `--font-serif`: Noto Serif. Títulos y encabezados (identidad editorial «tinta»).
- `--font-mono`: Consolas/Monaco. Código, hashes, datos técnicos.
- Escala en `rem`: `--text-h1` 1.75rem → `--text-xs` 0.75rem. `h1` se reduce a 1.5rem en móvil.

## Mecanismo de tema

- `src/utils/theme.js`: `getInitialTheme`, `applyTheme`, `setTheme`, `toggleTheme`.
- Persistencia: `localStorage['sgm-theme']`; valores `'dark'` | `'light'`; por defecto `'dark'`.
- Aplicación: atributo `data-theme` en `<html>` (más `class="dark"` de compatibilidad) y
  `meta[name="theme-color"]` (dark `#14110b`, light `#faf6ef`).
- Script inline en `index.html` (anti-FOUC) lee `localStorage` antes del primer render.
- Toggle de tema en `Header.jsx` (SVG sol/luna inline, sin dependencias).

## Gráficos (Chart.js / canvas)

Los canvas **no pueden leer `var()` de CSS** (la paleta se serializa al crear el chart), por lo
que las paletas inline de los gráficos usan hex/rgba concretos sintonizados al tema oscuro
(default):

| Antes | Ahora |
| --- | --- |
| `#3b82f6` / `#6366f1` / indigo (primario) | `#e2a63f` |
| `#10b981` / verde | `#34d399` |
| `#f59e0b` / ámbar | `#fbbf24` |
| `#ef4444` / rojo | `#f87171` |
| `#8b5cf6` / violeta | `#c084fc` |
| `#ec4899` / rosa | `#f472b6` |
| `#06b6d4` / cian | `#22d3ee` |
| `#14b8a6` / teal | `#2dd4bf` |
| `#fff` | `#f3ece0` |
| `#6b7280` / `#9ca3af` (grises) | `#c2b6a1` |
| `#374151` | `#3a3123` |
| `#cbd5e1` / `#e5e7eb` | `#3a3123` / `#2b251b` |
| tooltip `rgba(0,0,0,.8)` | `rgba(20,17,11,.95)` |
| grid `rgba(0,0,0,.1)` | `rgba(243,236,224,.08)` |

Los colores del **DOM** (títulos, texto, ticks si son HTMLElement) sí usan tokens CSS cuando es
posible (p. ej. título de PillarGauge → `var(--color-accent)`).

## Excepciones intencionales (documentadas, no remanentes)

- `src/pages/Profile.jsx`: export de QR con `html2canvas` usa fondo `#ffffff` (impresión).
- `src/components/common/reports/ChartExporter.jsx`: opciones de export «Blanco/Oscuro/
  Personalizado» (`#ffffff`, `#1f2937`) y patrón de cuadrícula `#ccc` (previsualización de
  exportación, ajena al tema de la app).
- `src/components/dashboard/ChurchDashboard.module.css` y análogos: `@media print` usa fondo
  blanco/tinta negra (impresión en papel).
- `src/components/common/Input.css`: chevron de `<select>` como data-URI SVG (`%236c757d`); un
  data-URI no puede consumir `var()`. Gris neutro legible en ambos temas.
- `src/pages/BiblicalStudents.module.css`: `var(--level)` es una custom property escrita desde
  JS en runtime (barra de progreso), no un token de diseño.

## Archivos

### Eliminados
- `src/App.css` (CSS muerto de la plantilla Vite, no importado por ningún módulo).

### Creados
- `src/utils/theme.js` — utilidad de tema.
- `src/pages/Churches.module.css` — CSS Module (antes estilos inline `styles.*` en `Churches.jsx`).
- `src/components/common/reports/ReportBuilder.module.css` — CSS Module del constructor de reportes.

### Modificados (núcleo)
- `src/index.css` — sistema de tokens (dark + light), estilos base, scrollbars, focus, media query.
- `index.html` — script anti-FOUC, `meta theme-color`, sin `class="dark"` estático.
- `src/assets/styles/globals.css` — `.card`, `.page`, `.table`, `.form-field`, `.badge`,
  `.empty-state` con tokens (tabla con thead accent + on-accent).
- `src/components/layout/Header.jsx` (+ toggle de tema), `Header.css`, `Layout.css`, `Sidebar.css`.

### Modificados (componentes comunes)
- `src/components/common/Button.css`, `Input.css`, `Loading.css` / `Loading.jsx`,
  `Modal.module.css` / `Modal.jsx` (fix wiring `extra-large` y `full-screen`),
  `DataTable.module.css`, `BulkImportModal.css`, `src/utils/notifications.module.css`.

### Modificados (páginas y componentes, vía subagentes)
- `src/pages/`: `Dashboard.jsx`, `Users`, `Members`, `Groups`, `BiblicalStudents`,
  `ChangePassword`, `Configuration`, `Profile`, `Reports`, `Login`, `Register`,
  `ForgotPassword`, `ResetPassword`, `NotFound`, `Unauthorized`.
- `src/components/dashboard/`: `DashboardKpis.jsx`, `MetricCard.jsx`, `PillarGauge.jsx`,
  `GoalsComparisonChart.jsx`, `LineChart.jsx`, `ChurchDashboard.jsx`, `AttendanceQrModal.jsx`.
- `src/components/forms/`: `ChurchStats.jsx`, `ChurchForm`, `BulkActions`, `UserStats`,
  `UserForm`, `StudentForm`, `MemberForm`, `GroupForm`.

## Verificación

- `npm run lint` → **0 errores / 0 warnings**.
- `npm run build` → OK (544 módulos, ~56 s).
- Sin remanentes de navy (`#003366`, `#4b68a5`, `#667eea`, `#043464`, `#061d36`, `#032a52`,
  `#0b0f19`, `#121212`, `#1e1e1e`, `#d4af37`) ni fuentes fantasma (Merriweather/Inter/Poppins)
  en ningún CSS.
- Todos los `var(--…)` referenciados existen en `src/index.css` (salvo `--level`, runtime).
- Hex en JSX: únicamente la paleta Miel & Tinta y las excepciones documentadas arriba.
