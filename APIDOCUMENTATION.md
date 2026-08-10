# APIDOCUMENTATION.md - Consumo de la API desde el Frontend (SGM)

Documento de referencia sobre cómo `iglesia-frontend/` se comunica con el backend.
La lista autoritativa de endpoints del backend está en `backend/APIDOCUMENTATION.md`.

## Base URL

- La base se lee de `VITE_API_URL` (`src/constants/index.js`), con fallback a
  `http://localhost:5000/api/v1`.
- Ejemplo: si el backend responde en `/api/v1/auth/login`, el frontend apunta a `/api/v1`.

## Sesión y autenticación

- Sesión por **cookies HttpOnly** del backend. Axios se configura con `withCredentials: true`
  (`src/services/api.js`), de modo que las cookies se envían automáticamente.
- No se guardan tokens en `localStorage` ni `sessionStorage`.
- Interceptor de respuestas (`api.js`): ante un `401` redirige a `/login`, salvo en las propias
  llamadas de auth (`/auth/login`, `/auth/refresh`).

## Envelope de respuesta

El backend responde siempre con:

- Éxito: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "error": { "code": "CODIGO", "message": "mensaje" } }`

Los servicios del frontend leen `response.data` (instancia axios devuelve el body directamente)
y, en los flujos con envelope, acceden a `data.data`.

## Capas de acceso

- `src/services/api.js` — instancia axios base, timeout 10s, `withCredentials`, interceptor de errores.
- `src/services/apiClient.js` — helper sobre `api.js` (`get/post/put/delete/patch`, `downloadFile`,
  `uploadFile`, `getWithCancel`) y constantes `ENDPOINTS` centralizadas.
- `src/services/*.js` — servicios por módulo (`authService`, `churchesService`, `groupsService`,
  `membersService`, `studentsService`, `usersService`, `reportsService`, `dashboard.Service`).
- `src/hooks/*` — exponen a las páginas el estado (lista, paginación, filtros) y las acciones.

## Endpoints usados (según el backend actual)

### Auth (`src/services/authService.js`)

| Método | Ruta                    | Uso |
|--------|-------------------------|-----|
| POST   | `/auth/login`           | Iniciar sesión |
| POST   | `/auth/signup`          | Registro |
| POST   | `/auth/refresh`         | Renovar sesión |
| POST   | `/auth/logout`          | Cerrar sesión |
| GET    | `/auth/me`              | Usuario actual |

### Dashboard

| Método | Ruta                            | Uso |
|--------|---------------------------------|-----|
| GET    | `/dashboard/spiritual-health`   | Pilares (escuela/avance/tutoría) |
| GET    | `/dashboard/kpis`               | KPIs del dashboard |

### Grupos

`/groups` (GET listado, POST crear), `/groups/:id` (GET, PUT), `/groups/:id/assign-teachers`,
`/groups/:id/disciple-pairs` (GET, POST).

### Estudiantes

`/students` (POST), `/students/group/:groupId` (GET), `/students/:id` (GET, PUT),
`/students/:id/lessons` (PUT progreso 1-20).

### Métricas y asistencia

- Métricas: `/metrics/weekly` (POST, GET), `/metrics/weekly/group/:groupId` (GET).
- Asistencia: `/attendance/bulk` (POST), `/attendance/group/:groupId` (GET),
  check-in público `/attendance/checkin/:groupId` (GET página, POST desde QR).

### Metas

- `/goals/quarterly` (POST), `/goals/quarterly/:id/close` (PUT),
  `/goals/quarterly/group/:groupId` (GET), `/goals/quarterly/quarter/:quarterId` (GET).

> `src/services/apiClient.js` define las constantes `ENDPOINTS` con las rutas canónicas;
> si un servicio usa una ruta no listada arriba, contrastar contra `backend/src/routes/`.

## Errores

- Los servicios capturan el error y lo muestran con `showNotification`
  (`src/utils/notifications.jsx`) o lo propagan al hook para exponerlo en la página.
- `ERROR_MESSAGES` (`src/constants/index.js`) centraliza los mensajes de red/validación/servidor.

## Peticiones con archivos

- Subida: `apiClient.uploadFile` / `postForm` con `Content-Type: multipart/form-data`.
- Descarga: `apiClient.downloadFile` con `responseType: 'blob'` (Excel/PDF).
