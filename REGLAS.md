# REGLAS.md - Reglas de Codificación del Frontend (SGM)

Reglas obligatorias para el código nuevo y las modificaciones en `iglesia-frontend/`.
El CI verifica `npm run lint` (bloqueante) y `npm run build` antes de aceptar un PR.

## Lint y tipos

1. `npm run lint` debe pasar con **0 errores y 0 warnings**. El pipeline usa `continue-on-error: false`.
2. Prohibido `any` y `@ts-ignore`. No añadir `eslint-disable` sin justificación documentada.
3. No dejar imports, variables o props sin usar (`no-unused-vars`). Si un estado solo usa el setter,
   declararlo como `const [, setX] = useState(...)`.
4. Los `useEffect` deben declarar correctamente sus dependencias; si es intencional omitir alguna,
   documentarlo con `// eslint-disable-next-line react-hooks/exhaustive-deps`.

## Arquitectura

5. Separación de responsabilidades:
   - `pages/` — orquestan la UI, consumen hooks y llaman a servicios.
   - `components/common/` — componentes genéricos reutilizables (DataTable, Modal, Button, Loading).
   - `components/forms/` y `components/dashboard/` — componentes de dominio.
   - `hooks/` — estado de datos y acciones por módulo.
   - `services/` — llamadas HTTP. `api.js` centraliza la instancia axios e interceptor.
6. La URL base de la API se lee de `VITE_API_URL` (`src/constants/index.js`). No hardcodear rutas.

## Estilo

7. Componentes funcionales con hooks. No clases.
8. Estilos con CSS Modules (`*.module.css`) junto al componente.
9. Mensajes al usuario mediante `showNotification` (`src/utils/notifications.jsx`), no `alert()`.
10. Iconos de `react-icons`. Gráficas con Chart.js (`react-chartjs-2`).

## Seguridad

11. No guardar tokens en `localStorage`; la sesión usa cookies HttpOnly del backend
    (`withCredentials` en axios).
12. No loguear secretos. No exponer datos sensibles en el cliente que el backend no envíe.

## Antes de abrir un PR

13. `npm run lint` y `npm run build` deben pasar.
14. Probar los flujos afectados en `npm run dev` contra un backend en ejecución.
