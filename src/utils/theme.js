// Utilidades de tema (modo oscuro / claro)
// El tema se persiste en localStorage bajo la clave 'sgm-theme'
// y se aplica como atributo data-theme en <html>.

export const THEME_KEY = 'sgm-theme';

export const THEME_META_COLORS = {
  dark: '#14110b',
  light: '#faf6ef',
};

const isValidTheme = (theme) => theme === 'dark' || theme === 'light';

export const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (isValidTheme(stored)) return stored;
  } catch (error) {
    console.error('Error leyendo tema de localStorage:', error);
  }
  return 'dark';
};

export const applyTheme = (theme) => {
  const safe = isValidTheme(theme) ? theme : 'dark';
  const root = document.documentElement;
  root.setAttribute('data-theme', safe);
  root.classList.toggle('dark', safe === 'dark');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_META_COLORS[safe]);
  }
};

export const setTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error guardando tema en localStorage:', error);
  }
  applyTheme(theme);
  return theme;
};

export const toggleTheme = (currentTheme) => {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  return setTheme(next);
};
