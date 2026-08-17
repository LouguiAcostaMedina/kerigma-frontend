/**
 * Hook for consuming the system catalog (GET /catalog).
 *
 * Catalog data is static for the lifetime of the session, so we cache at module
 * level — multiple components that call useCatalog() share a single fetch.
 * Falls back to hardcoded constants from constants/roles.js if the API call
 * fails (e.g. offline, backend not yet deployed with catalog endpoint).
 */

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/apiClient';
import { ROLE_OPTIONS, ROLE_LABELS, ROLES, TEACHER_ROLES, PASTOR_ROLES, LEADER_ROLES } from '../constants/roles';

let catalogCache = null;
let catalogPromise = null;

function fetchCatalog() {
  if (catalogCache) return Promise.resolve(catalogCache);
  if (catalogPromise) return catalogPromise;

  catalogPromise = apiClient
    .get('/catalog')
    .then((response) => {
      const data = response?.data?.data ?? response?.data;
      if (data && typeof data === 'object') {
        catalogCache = data;
        return catalogCache;
      }
      return null;
    })
    .catch(() => {
      catalogPromise = null;
      return null;
    });

  return catalogPromise;
}

/**
 * @param {string} catalogName — key of the catalog (e.g. 'roles', 'memberStatuses')
 * @returns {{ entries: Array<{value: string, label: string}>, labels: Record<string, string>, values: string[] }}
 */
export function getCatalogEntries(catalogName) {
  if (!catalogCache) return null;
  return catalogCache[catalogName] ?? null;
}

/**
 * @param {string} catalogName
 * @param {string} value
 * @returns {string | undefined}
 */
export function getCatalogLabel(catalogName, value) {
  const cat = getCatalogEntries(catalogName);
  if (!cat) return undefined;
  if (cat.labels && cat.labels[value] !== undefined) return cat.labels[value];
  const entry = cat.entries?.find((e) => e.value === value);
  return entry?.label;
}

/**
 * @returns {{
 *   ready: boolean,
 *   catalogs: Record<string, unknown> | null,
 *   getEntries: (name: string) => Array<{value: string, label: string}> | null,
 *   getLabels: (name: string) => Record<string, string> | null,
 *   getValues: (name: string) => string[] | null,
 *   getLabel: (name: string, value: string) => string | undefined,
 *   // Convenience for common catalogs (fallback to hardcoded)
 *   roleOptions: Array<{value: string, label: string}>,
 *   roleLabels: Record<string, string>,
 *   roles: Record<string, string>,
 *   teacherRoles: string[],
 * }}
 */
export function useCatalog() {
  const [ready, setReady] = useState(catalogCache !== null);
  const [catalogs, setCatalogs] = useState(catalogCache);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then((data) => {
      if (!cancelled) {
        if (data) {
          setCatalogs(data);
          setReady(true);
        } else {
          setReady(true); // ready with fallback
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const roleOptions = useMemo(() => {
    const cat = catalogs?.roles;
    return cat?.entries ?? ROLE_OPTIONS;
  }, [catalogs]);

  const roleLabels = useMemo(() => {
    const cat = catalogs?.roles;
    return cat?.labels ?? ROLE_LABELS;
  }, [catalogs]);

  const roles = useMemo(() => {
    const cat = catalogs?.roles;
    if (!cat?.values) return ROLES;
    const map = {};
    for (const v of cat.values) map[v.toUpperCase()] = v;
    return map;
  }, [catalogs]);

  const teacherRoles = useMemo(() => {
    const cat = catalogs?.roles;
    if (!cat?.values) return TEACHER_ROLES;
    return cat.values.filter((v) => ['leader', 'director', 'admin'].includes(v));
  }, [catalogs]);

  const pastorRoles = useMemo(() => {
    const cat = catalogs?.roles;
    if (!cat?.values) return PASTOR_ROLES;
    return cat.values.filter((v) => ['director', 'admin', 'super_admin'].includes(v));
  }, [catalogs]);

  const leaderRoles = useMemo(() => {
    const cat = catalogs?.roles;
    if (!cat?.values) return LEADER_ROLES;
    return cat.values.filter((v) => ['leader', 'director', 'admin', 'super_admin'].includes(v));
  }, [catalogs]);

  return useMemo(
    () => ({
      ready,
      catalogs,
      getEntries: (name) => getCatalogEntries(name),
      getLabels: (name) => {
        const cat = getCatalogEntries(name);
        return cat?.labels ?? null;
      },
      getValues: (name) => {
        const cat = getCatalogEntries(name);
        return cat?.values ?? null;
      },
      getLabel: (name, value) => getCatalogLabel(name, value),
      roleOptions,
      roleLabels,
      roles,
      teacherRoles,
      pastorRoles,
      leaderRoles,
    }),
    [ready, catalogs, roleOptions, roleLabels, roles, teacherRoles, pastorRoles, leaderRoles],
  );
}
