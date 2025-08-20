/**
 * Hook personalizado para la gestión de Estudiantes Bíblicos
 * Maneja el estado y operaciones CRUD de estudiantes bíblicos
 */

import { useState, useCallback, useRef } from 'react';
import { studentsService } from '@/services/studentsService';
import { showNotification } from '@/utils/notifications';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // Referencias para evitar llamadas duplicadas
  const abortControllerRef = useRef(null);
  const lastParamsRef = useRef(null);

  // Obtener lista de estudiantes con filtros y paginación
  const fetchStudents = useCallback(async (params = {}) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador de cancelación
    abortControllerRef.current = new AbortController();

    // Evitar llamadas duplicadas con los mismos parámetros
    const paramsString = JSON.stringify(params);
    if (paramsString === lastParamsRef.current) {
      return;
    }
    lastParamsRef.current = paramsString;

    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.getStudents({
        ...params,
        signal: abortControllerRef.current.signal
      });

      setStudents(response.data || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0
      });

      return response;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching students:', err);
        setError(err.message || 'Error al cargar los estudiantes');
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los estudiantes'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un estudiante específico
  const fetchStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.getStudentById(id);
      setStudent(response);
      return response;
    } catch (err) {
      console.error('Error fetching student:', err);
      setError(err.message || 'Error al cargar el estudiante');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar el estudiante'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo estudiante
  const createStudent = useCallback(async (studentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.createStudent(studentData);
      
      // Actualizar lista local
      setStudents(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante bíblico creado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating student:', err);
      setError(err.message || 'Error al crear el estudiante');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear el estudiante'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estudiante existente
  const updateStudent = useCallback(async (id, studentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.updateStudent(id, studentData);
      
      // Actualizar lista local
      setStudents(current =>
        current.map(student => student.id === id ? response : student)
      );
      
      // Actualizar estudiante individual si está cargado
      if (student?.id === id) {
        setStudent(response);
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante actualizado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.message || 'Error al actualizar el estudiante');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar el estudiante'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student]);

  // Eliminar estudiante
  const deleteStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await studentsService.deleteStudent(id);
      
      // Actualizar lista local
      setStudents(current => current.filter(student => student.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante eliminado correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error deleting student:', err);
      setError(err.message || 'Error al eliminar el estudiante');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar el estudiante'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar múltiples estudiantes
  const deleteMultipleStudents = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      await studentsService.deleteMultipleStudents(ids);
      
      // Actualizar lista local
      setStudents(current => current.filter(student => !ids.includes(student.id)));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${ids.length} estudiante(s) eliminado(s) correctamente`
      });

      return true;
    } catch (err) {
      console.error('Error deleting multiple students:', err);
      setError(err.message || 'Error al eliminar los estudiantes');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar los estudiantes seleccionados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de estudiante
  const updateStudentStatus = useCallback(async (id, status) => {
    try {
      const response = await studentsService.updateStudentStatus(id, status);
      
      // Actualizar lista local
      setStudents(current =>
        current.map(student => 
          student.id === id ? { ...student, status } : student
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Estado del estudiante actualizado a ${status}`
      });

      return response;
    } catch (err) {
      console.error('Error updating student status:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el estado del estudiante'
      });
      throw err;
    }
  }, []);

  // Actualizar nivel de estudiante
  const updateStudentLevel = useCallback(async (id, level) => {
    try {
      const response = await studentsService.updateStudentLevel(id, level);
      
      // Actualizar lista local
      setStudents(current =>
        current.map(student => 
          student.id === id ? { ...student, level } : student
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Nivel del estudiante actualizado a ${level}`
      });

      return response;
    } catch (err) {
      console.error('Error updating student level:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el nivel del estudiante'
      });
      throw err;
    }
  }, []);

  // Obtener progreso de estudiante
  const fetchStudentProgress = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.getStudentProgress(id);
      setStudentProgress(response);
      return response;
    } catch (err) {
      console.error('Error fetching student progress:', err);
      setError(err.message || 'Error al cargar el progreso del estudiante');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar sesión de estudio
  const recordStudySession = useCallback(async (studentId, sessionData) => {
    try {
      const response = await studentsService.recordStudySession(studentId, sessionData);
      
      // Actualizar sesiones locales
      setStudySessions(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Sesión de estudio registrada correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error recording study session:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al registrar la sesión de estudio'
      });
      throw err;
    }
  }, []);

  // Obtener sesiones de estudio
  const fetchStudySessions = useCallback(async (id, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentsService.getStudySessions(id, params);
      setStudySessions(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching study sessions:', err);
      setError(err.message || 'Error al cargar las sesiones de estudio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar estudiante como bautizado
  const markAsBaptized = useCallback(async (id, baptismData) => {
    try {
      const response = await studentsService.markAsBaptized(id, baptismData);
      
      // Actualizar lista local
      setStudents(current =>
        current.map(student => 
          student.id === id ? { ...student, baptized: true, baptismDate: baptismData.baptismDate } : student
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante marcado como bautizado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error marking student as baptized:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al marcar el estudiante como bautizado'
      });
      throw err;
    }
  }, []);

  // Convertir estudiante en miembro
  const convertToMember = useCallback(async (id, memberData) => {
    try {
      const response = await studentsService.convertToMember(id, memberData);
      
      // Remover de la lista de estudiantes
      setStudents(current => current.filter(student => student.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante convertido a miembro correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error converting student to member:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al convertir el estudiante a miembro'
      });
      throw err;
    }
  }, []);

  // Obtener lecciones
  const fetchLessons = useCallback(async () => {
    try {
      const response = await studentsService.getLessons();
      setLessons(response);
      return response;
    } catch (err) {
      console.error('Error fetching lessons:', err);
      throw err;
    }
  }, []);

  // Asignar lección a estudiante
  const assignLesson = useCallback(async (studentId, lessonId) => {
    try {
      const response = await studentsService.assignLesson(studentId, lessonId);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Lección asignada correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error assigning lesson:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar la lección'
      });
      throw err;
    }
  }, []);

  // Marcar lección como completada
  const completeLesson = useCallback(async (studentId, lessonId, completionData) => {
    try {
      const response = await studentsService.completeLesson(studentId, lessonId, completionData);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Lección marcada como completada'
      });

      return response;
    } catch (err) {
      console.error('Error completing lesson:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al completar la lección'
      });
      throw err;
    }
  }, []);

  // Exportar a Excel
  const exportToExcel = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      const blob = await studentsService.exportToExcel(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estudiantes_biblicos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Archivo Excel descargado correctamente'
      });
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar a Excel'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar a PDF
  const exportToPDF = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      const blob = await studentsService.exportToPDF(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estudiantes_biblicos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Archivo PDF descargado correctamente'
      });
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar a PDF'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar desde Excel
  const importFromExcel = useCallback(async (file) => {
    setLoading(true);
    
    try {
      const response = await studentsService.importFromExcel(file);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${response.imported} estudiante(s) importado(s) correctamente`
      });

      // Recargar datos
      await fetchStudents();

      return response;
    } catch (err) {
      console.error('Error importing from Excel:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al importar desde Excel'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  // Graduar estudiante
  const graduateStudent = useCallback(async (id, graduationData) => {
    try {
      const response = await studentsService.graduateStudent(id, graduationData);
      
      // Actualizar lista local
      setStudents(current =>
        current.map(student => 
          student.id === id ? { ...student, graduated: true, graduationDate: graduationData.graduationDate } : student
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Estudiante graduado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error graduating student:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al graduar el estudiante'
      });
      throw err;
    }
  }, []);

  // Enviar recordatorio
  const sendReminder = useCallback(async (id, reminderData) => {
    try {
      const response = await studentsService.sendReminder(id, reminderData);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Recordatorio enviado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error sending reminder:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al enviar el recordatorio'
      });
      throw err;
    }
  }, []);

  // Limpiar estado
  const clearStudent = useCallback(() => {
    setStudent(null);
  }, []);

  const clearStudentProgress = useCallback(() => {
    setStudentProgress(null);
  }, []);

  const clearStudySessions = useCallback(() => {
    setStudySessions([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cancelar peticiones pendientes
  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // Estado
    students,
    student,
    studentProgress,
    studySessions,
    lessons,
    loading,
    error,
    pagination,
    
    // Acciones CRUD
    fetchStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    deleteMultipleStudents,
    
    // Acciones específicas
    updateStudentStatus,
    updateStudentLevel,
    markAsBaptized,
    convertToMember,
    graduateStudent,
    sendReminder,
    
    // Progreso y sesiones
    fetchStudentProgress,
    recordStudySession,
    fetchStudySessions,
    
    // Lecciones
    fetchLessons,
    assignLesson,
    completeLesson,
    
    // Importar/Exportar
    exportToExcel,
    exportToPDF,
    importFromExcel,
    
    // Utilidades
    clearStudent,
    clearStudentProgress,
    clearStudySessions,
    clearError,
    cancelRequests,
    
    // Estados derivados
    hasStudents: students.length > 0,
    isEmpty: students.length === 0 && !loading,
    isLoading: loading,
    hasError: !!error
  };
};