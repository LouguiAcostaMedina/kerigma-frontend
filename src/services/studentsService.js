/**
 * Servicio para la gestión de Estudiantes Bíblicos
 * Maneja todas las operaciones CRUD de estudiantes bíblicos
 */

import apiClient from './apiClient';

export const studentsService = {
  // Obtener todos los estudiantes con filtros y paginación
  getStudents: async (params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        church: params.church || '',
        group: params.group || '',
        instructor: params.instructor || '',
        status: params.status || '',
        level: params.level || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString();

      const response = await apiClient.get(`/students?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Obtener un estudiante por ID
  getStudentById: async (id) => {
    try {
      const response = await apiClient.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Crear un nuevo estudiante
  createStudent: async (studentData) => {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Actualizar un estudiante existente
  updateStudent: async (id, studentData) => {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Eliminar un estudiante
  deleteStudent: async (id) => {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Eliminar múltiples estudiantes
  deleteMultipleStudents: async (ids) => {
    try {
      const response = await apiClient.delete('/students/bulk', { data: { ids } });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple students:', error);
      throw error;
    }
  },

  // Obtener estadísticas de estudiantes
  getStudentsStats: async () => {
    try {
      const response = await apiClient.get('/students/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching students stats:', error);
      throw error;
    }
  },

  // Actualizar estado de un estudiante
  updateStudentStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/students/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error;
    }
  },

  // Actualizar nivel de un estudiante
  updateStudentLevel: async (id, level) => {
    try {
      const response = await apiClient.patch(`/students/${id}/level`, { level });
      return response.data;
    } catch (error) {
      console.error('Error updating student level:', error);
      throw error;
    }
  },

  // Obtener progreso de un estudiante
  getStudentProgress: async (id) => {
    try {
      const response = await apiClient.get(`/students/${id}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  },

  // Registrar sesión de estudio
  recordStudySession: async (studentId, sessionData) => {
    try {
      const response = await apiClient.post(`/students/${studentId}/sessions`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error recording study session:', error);
      throw error;
    }
  },

  // Obtener sesiones de estudio
  getStudySessions: async (id, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        startDate: params.startDate || '',
        endDate: params.endDate || ''
      }).toString();

      const response = await apiClient.get(`/students/${id}/sessions?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      throw error;
    }
  },

  // Marcar estudiante como bautizado
  markAsBaptized: async (id, baptismData) => {
    try {
      const response = await apiClient.post(`/students/${id}/baptize`, baptismData);
      return response.data;
    } catch (error) {
      console.error('Error marking student as baptized:', error);
      throw error;
    }
  },

  // Convertir estudiante en miembro
  convertToMember: async (id, memberData) => {
    try {
      const response = await apiClient.post(`/students/${id}/convert-member`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error converting student to member:', error);
      throw error;
    }
  },

  // Obtener lecciones disponibles
  getLessons: async () => {
    try {
      const response = await apiClient.get('/students/lessons');
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Asignar lección a estudiante
  assignLesson: async (studentId, lessonId) => {
    try {
      const response = await apiClient.post(`/students/${studentId}/lessons`, {
        lessonId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning lesson to student:', error);
      throw error;
    }
  },

  // Marcar lección como completada
  completeLesson: async (studentId, lessonId, completionData) => {
    try {
      const response = await apiClient.put(`/students/${studentId}/lessons/${lessonId}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  // Exportar estudiantes a Excel
  exportToExcel: async (filters = {}) => {
    try {
      const response = await apiClient.post('/students/export/excel', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting students to Excel:', error);
      throw error;
    }
  },

  // Exportar estudiantes a PDF
  exportToPDF: async (filters = {}) => {
    try {
      const response = await apiClient.post('/students/export/excel', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting students to PDF:', error);
      throw error;
    }
  },

  // Importar estudiantes desde Excel
  importFromExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/students/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing students from Excel:', error);
      throw error;
    }
  },

  // Enviar recordatorio a estudiante
  sendReminder: async (id, reminderData) => {
    try {
      const response = await apiClient.post(`/students/${id}/remind`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  },

  // Graduar estudiante
  graduateStudent: async (id, graduationData) => {
    try {
      const response = await apiClient.post(`/students/${id}/graduate`, graduationData);
      return response.data;
    } catch (error) {
      console.error('Error graduating student:', error);
      throw error;
    }
  }
};