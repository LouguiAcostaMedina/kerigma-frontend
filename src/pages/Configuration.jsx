import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente de la página de Configuración del Sistema
 * Permite gestionar los parámetros globales del Sistema Misionero
 */
const Configuration = () => {
  const { user } = useAuth();
  
  // Estados para simular la persistencia de los campos
  const [systemName, setSystemName] = useState('Sistema Misionero');
  const [allowRegister, setAllowRegister] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulación de petición a la API (/api/v1/auth/config)
    setTimeout(() => {
      setIsSaving(false);
      alert('¡Configuración guardada con éxito!');
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Configuración del Sistema</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las preferencias globales, copias de seguridad y seguridad de la plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: Configuración General */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Aplicación
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma Predeterminado
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Seguridad y Accesos */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Seguridad y Accesos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium text-gray-800">
                  Permitir Nuevos Registros
                </span>
                <span className="text-xs text-gray-500">
                  Habilita o deshabilita el formulario público de registro para nuevos usuarios.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowRegister}
                onChange={(e) => setAllowRegister(e.target.checked)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Base de Datos (PostgreSQL en Render) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Mantenimiento y Respaldo (PostgreSQL)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de Copias de Seguridad Automatizadas
              </label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Cada 24 horas (Recomendado)</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Iniciando respaldo de PostgreSQL...')}
                className="px-4 py-2 text-sm bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition"
              >
                📦 Respaldar Base de Datos Ahora
              </button>
            </div>
          </div>
        </div>

        {/* Botón de Enviar Formulario */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2 text-white font-semibold rounded-md shadow transition ${
              isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Configuration;