/**
 * Chequeo anti-hardcode del catálogo de roles (1.1).
 *
 * Garantías:
 *  1. `src/constants/roles.js` cubre EXACTAMENTE los 5 roles del ENUM del backend
 *     (super_admin, admin, director, leader, reader) con etiqueta y opción de select.
 *  2. Los archivos de UI que muestran/editan el rol usan el catálogo y NO definen
 *     listas sueltas de roles que omitan super_admin.
 *
 * Sin dependencias: node scripts/check-roles.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLES, ROLE_LABELS, ROLE_OPTIONS, TEACHER_ROLES, PASTOR_ROLES, LEADER_ROLES } from '../src/constants/roles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '../src');

const BACKEND_ROLES = ['super_admin', 'admin', 'director', 'leader', 'reader'];
const ROLE_STR = '(super_admin|admin|director|leader|reader)';
const ROLE_LITERAL_RE = new RegExp(`'${ROLE_STR}'`, 'g');
const ARRAY_LITERAL_RE = /\[[^\]]*\]/g;

// Ubicaciones de 1.1/1.2: role visible/editable debe salir SIEMPRE del catálogo.
const UI_FILES = [
  'components/forms/UserForm.jsx',
  'pages/Users.jsx',
  'components/forms/UserStats.jsx',
  'components/forms/BulkActions.jsx',
  'components/forms/GroupForm.jsx',
];

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  [FAIL] ${msg}`);
};

console.log('Chequeo anti-hardcode de roles...');

// 1) Catálogo completo y consistente con el ENUM del backend
const catalogValues = new Set(Object.values(ROLES));
const optionValues = new Set(ROLE_OPTIONS.map((o) => o.value));

for (const role of BACKEND_ROLES) {
  if (!catalogValues.has(role)) fail(`ROLES no incluye '${role}'`);
  if (!ROLE_LABELS[role]) fail(`ROLE_LABELS no tiene etiqueta para '${role}'`);
  if (!optionValues.has(role)) fail(`ROLE_OPTIONS no incluye '${role}'`);
}

// 1b) Sin roles fantasma: el catálogo solo contiene roles del ENUM y los
//     agrupadores (TEACHER_ROLES/PASTOR_ROLES/LEADER_ROLES) solo referencian roles válidos.
for (const value of catalogValues) {
  if (!BACKEND_ROLES.includes(value)) fail(`ROLES incluye rol inexistente en el backend: '${value}'`);
}
for (const [name, list] of Object.entries({ TEACHER_ROLES, PASTOR_ROLES, LEADER_ROLES })) {
  for (const role of list) {
    if (!catalogValues.has(role)) fail(`${name} incluye rol fantasma: '${role}'`);
  }
}

// 2) Archivos de UI: deben referenciar el catálogo y no definir listas sueltas
for (const rel of UI_FILES) {
  const src = readFileSync(resolve(srcDir, rel), 'utf8');
  const usesCatalog = /\b(TEACHER_ROLES|PASTOR_ROLES|LEADER_ROLES|ROLES|ROLE_OPTIONS|ROLE_LABELS)\b/.test(src);
  if (!usesCatalog) fail(`${rel}: no referencia el catálogo (ROLES/ROLE_OPTIONS/ROLE_LABELS/TEACHER_ROLES/...)`);

  let m;
  while ((m = ARRAY_LITERAL_RE.exec(src)) !== null) {
    const arr = m[0];
    const found = [...new Set([...arr.matchAll(ROLE_LITERAL_RE)].map((x) => x[1]))];
    if (found.length >= 2 && !found.includes('super_admin')) {
      fail(`${rel}: lista de roles sin 'super_admin': ${arr.slice(0, 100)}`);
    }
  }
}

if (failures > 0) {
  console.error(`\nChequeo FALLÓ (${failures} problema(s)).`);
  process.exit(1);
}
console.log('Chequeo OK: catálogo completo y sin listas sueltas de roles.');
