# 📌 Sistema de Gestión Misionera – Frontend  

![React](https://img.shields.io/badge/React-18.0.0-blue?style=for-the-badge&logo=react)  
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-orange?style=for-the-badge)

El **Sistema de Gestión Misionera (SGM)** es una aplicación web desarrollada en **React** para la gestión integral de la obra misionera de la iglesia.  
Incluye módulos de **miembros, grupos, estudiantes bíblicos y dashboard interactivo** con autenticación basada en **roles jerárquicos** y funcionalidades avanzadas como **importación/exportación, reportes y métricas en tiempo real**.  

---

## ✨ Características principales  

### 🔐 Sistema de Autenticación  
- ✅ Login con **JWT** y manejo de errores  
- ✅ Registro de usuarios con validación  
- ✅ Cambio de contraseña con verificación  
- ✅ Perfil editable con **código QR**  
- ✅ Rutas protegidas por roles jerárquicos  

### 📊 Dashboard Principal  
- ✅ Métricas dinámicas con **Chart.js**  
- ✅ Tarjetas con estadísticas y animaciones  
- ✅ Filtros avanzados por período  
- ✅ Cache inteligente para optimización  

### 🗃️ CRUD Completo  
#### 👥 Miembros  
- CRUD completo, filtros y búsqueda avanzada  
- Importación desde **Excel** y exportación **Excel/PDF**  
- Asignación a grupos y gestión de estados  

#### 👨‍👩‍👧 Grupos  
- Gestión completa con estadísticas y duplicación  
- Asignación de líderes y control de reuniones  

#### 📖 Estudiantes Bíblicos  
- Seguimiento de progreso, niveles y bautismos  
- Graduación y conversión a miembros  
- Sistema de recordatorios y seguimiento  

### 🧩 Componentes Reutilizables  
- `DataTable` genérica con paginación, filtros y acciones  
- `Modal` dinámico reutilizable  
- `Button`, `Loading` y `NotificationSystem`  

### ⚡ Funcionalidades Avanzadas  
- Roles jerárquicos: **Administrador → Director → Líder → Lector**  
- Permisos granulares por acción  
- Paginación del servidor y búsqueda en tiempo real  
- Exportación/Importación con filtros aplicados  
- Manejo robusto de errores  

---

## 📂 Estructura del Proyecto  

```bash
src/
├── components/
│   ├── auth/                 # Rutas protegidas
│   ├── common/               # Componentes genéricos
│   ├── dashboard/            # Dashboard y métricas
│   ├── members/              # Gestión de miembros
│   └── AppRouter.jsx         # Configuración de rutas
├── hooks/                    # Hooks personalizados
├── pages/                    # Páginas principales
├── services/                 # Servicios API
├── utils/                    # Notificaciones y helpers
└── App.jsx                   # Componente principal

## 🚀 Instalación y Uso  

### 1️⃣ Clonar repositorio  
```bash
git clone https://github.com/tuusuario/sistema-gestion-misionera-frontend.git
cd sistema-gestion-misionera-frontend

2️⃣ Instalar dependencias
npm install

3️⃣ Ejecutar en modo desarrollo
npm run dev


La app estará disponible en 👉 http://localhost:5173

📦 Dependencias principales
npm install chart.js react-chartjs-2 react-icons qrcode xlsx jspdf jspdf-autotable html2canvas

📊 Próximos módulos

📑 Sistema de Reportes Avanzados

⛪ Gestión de Iglesias

👥 Administración de Usuarios

⚡ Métricas en Tiempo Real (WebSockets)

🔔 Notificaciones Push

🏆 Características destacadas

✅ Arquitectura modular y escalable

✅ Código limpio y documentado

✅ Optimización con lazy loading y cache

✅ Diseño moderno y accesible

✅ Listo para producción con build optimizado

🔗 Backend

Este frontend está diseñado para conectarse a un backend en Node.js + Express + PostgreSQL.

👉 Repositorio backend: (pendiente agregar)

