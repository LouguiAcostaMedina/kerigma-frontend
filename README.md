# Frontend - Sistema de Gestión Misionera (SGM)

SPA en **React 19 + Vite 7 + react-router-dom 7**. Dashboard con Chart.js y exportaciones
con jsPDF / xlsx-js-style. Consume la API REST del backend (`backend/`).

## Requisitos

- Node.js 20+
- Backend en ejecución (ver `backend/README.md`)

## Configuración

1. Crear `iglesia-frontend/.env` con las variables de entorno (`.env` no se sube al repo):

   ```bash
   VITE_API_URL=http://localhost:5000/api/v1
   ```

   Variable principal: `VITE_API_URL` (leída en `src/constants/index.js`).
   Si no se define, se usa el fallback `http://localhost:5000/api/v1`.
   Otras opcionales: `VITE_WS_URL`, `VITE_APP_NAME`, `VITE_API_TIMEOUT`, `VITE_ENABLE_LOGS`.

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Ejecutar:

   ```bash
   npm run dev
   ```

   La app estará disponible en `http://localhost:5173`.

## Comandos

| Comando         | Descripción                     |
|-----------------|---------------------------------|
| `npm run dev`   | Servidor de desarrollo Vite     |
| `npm run build` | `vite build` -> `dist/`         |
| `npm run lint`  | `eslint .` (debe quedar en 0)   |
| `npm run preview` | Previsualizar build            |

## Estructura

```
src/
├── main.jsx / App.jsx        # Bootstrap y composición
├── components/
│   ├── AppRouter.jsx         # Configuración de rutas y lazy loading
│   ├── auth/                 # Rutas protegidas (ProtectedRoute)
│   ├── common/               # DataTable, Modal, Button, Loading, reports/*
│   ├── dashboard/            # KPIs, gráficas, pilares, check-in QR
│   ├── forms/                # ChurchForm, ChurchStats, UserForm, UserStats, BulkActions
│   └── layout/               # Header, Sidebar, Layout
├── contexts/
│   └── AuthContext.jsx       # Sesión, usuario y permisos
├── hooks/                    # useAuth, useChurches, useGroups, useMembers, useStudents, useUsers, useReports
├── pages/                    # Login, Register, Dashboard, Members, Groups, Churches, Users, ...
├── services/                 # api.js (axios), apiClient.js y servicios por módulo
├── constants/                # API_BASE_URL, roles, mensajes, paginación
└── utils/                    # notifications, dashboardExport, helpers
```

## Roles

| Rol           | `ROLES`      |
|---------------|--------------|
| Administrador | `administrador` |
| Director      | `director`      |
| Líder         | `lider`         |
| Lector        | `lector`        |

Los permisos por acción se derivan del `role` del usuario en cada página (ej.:
`['administrador', 'director'].includes(user?.role)`).

## Consumo de la API

- Instancia axios con `withCredentials` (cookies HttpOnly) en `src/services/api.js`.
- Interceptor de respuestas redirige a `/login` en `401` (excepto llamadas de auth).
- Envelope esperado del backend: `{ ok, data }` / `{ ok, error }`.

## Documentación

- `AGENTS.md` — contexto para agentes de IA.
- `REGLAS.md` — reglas de codificación.
- `APIDOCUMENTATION.md` — endpoints usados y convenciones.
