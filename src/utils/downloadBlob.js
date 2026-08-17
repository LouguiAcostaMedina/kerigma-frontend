/**
 * Dispara la descarga de un Blob como archivo en el navegador.
 * Utilidad compartida usada por ExportMenu y hooks de exportación.
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'archivo';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Genera un timestamp YYYY-MM-DD para nombres de archivo.
 */
export function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}
