import React from 'react';
import { useCatalog } from '@/hooks/useCatalog';

/**
 * Select de roles alimentado por el catálogo único.
 * @param {object} props
 * @param {string} [props.value] - Valor seleccionado
 * @param {(value: string) => void} [props.onChange]
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {string} [props.placeholder='Seleccionar rol']
 * @param {string[]} [props.exclude] - Roles a excluir de la lista
 */
export function RoleSelect({
  value,
  onChange,
  name = 'role',
  id,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar rol',
  exclude = [],
}) {
  const { roleOptions } = useCatalog();

  const options = roleOptions.filter((opt) => !exclude.includes(opt.value));

  return (
    <select
      name={name}
      id={id || name}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      disabled={disabled}
      className={className}
      aria-label="Rol"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

/**
 * Select genérico alimentado por un catálogo del sistema.
 * @param {object} props
 * @param {string} props.catalogName - Nombre del catálogo (e.g. 'memberStatuses')
 * @param {string} [props.value]
 * @param {(value: string) => void} [props.onChange]
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {string} [props.placeholder]
 * @param {string[]} [props.exclude]
 */
export function OptionsSelect({
  catalogName,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar...',
  exclude = [],
}) {
  const { getEntries } = useCatalog();
  const entries = getEntries(catalogName)?.entries || [];
  const options = entries.filter((opt) => !exclude.includes(opt.value));

  return (
    <select
      name={name || catalogName}
      id={id || name || catalogName}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      disabled={disabled}
      className={className}
      aria-label={catalogName}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default RoleSelect;
