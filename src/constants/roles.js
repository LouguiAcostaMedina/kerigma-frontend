// Roles del sistema (coinciden con el ENUM del backend: super_admin | admin | director | leader | reader)
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DIRECTOR: 'director',
  LEADER: 'leader',
  READER: 'reader'
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.LEADER]: 'Líder', 
  [ROLES.READER]: 'Lector'
};

// Matriz RBAC: permisos por rol.
// Formato de cada permiso: "<módulo>.<acción>" o wildcard "<módulo>.*" / "*".
// - super_admin / admin: acceso total.
// - director: administra usuarios e iglesias, CRUD de members/groups/students.
// - leader: lee, crea y edita members/groups/students.
// - reader: solo lectura de members/groups/students.
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: ['*'],
  [ROLES.DIRECTOR]: [
    'users.read', 'users.create', 'users.update', 'users.delete',
    'users.bulk', 'users.invite', 'users.reset_password',
    'churches.*',
    'members.*',
    'groups.*',
    'students.*'
  ],
  [ROLES.LEADER]: [
    'members.read', 'members.create', 'members.update',
    'groups.read', 'groups.create', 'groups.update',
    'students.read', 'students.create', 'students.update'
  ],
  [ROLES.READER]: [
    'members.read',
    'groups.read',
    'students.read'
  ]
};
