/**
 * Página de Gestión de Estudiantes Bíblicos
 * Lista, crea, edita y elimina estudiantes bíblicos
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudents } from '@/hooks/useStudents';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { 
  FaPlus, 
  FaDownload, 
  FaUpload,
  FaSearch, 
  FaUserGraduate,
  FaTrash,
  FaGraduationCap,
  FaBell,
  FaChartLine,
  FaBook,
  FaTrophy
} from 'react-icons/fa';
import { showNotification } from '@/utils/notifications';
import styles from './BiblicalStudents.module.css';

const BiblicalStudents = () => {
  const { user } = useAuth();
  const {
    students,
    loading,
    pagination,
    fetchStudents,
    deleteStudent,
    deleteMultipleStudents,
    updateStudentStatus,
    updateStudentLevel,
    markAsBaptized,
    convertToMember,
    graduateStudent,
    sendReminder,
    exportToExcel,
    exportToPDF,
    importFromExcel
  } = useStudents();

  // Estados locales
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showBaptismModal, setShowBaptismModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    church: '',
    instructor: '',
    status: 'active',
    level: '',
    baptized: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadStudents();
  }, [filters, sortConfig]);

  // Función para cargar estudiantes
  const loadStudents = async (page = 1) => {
    const params = {
      page,
      limit: 20,
      search: searchTerm,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.order,
      ...filters
    };

    try {
      await fetchStudents(params);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Configuración de columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'photo',
      title: 'Foto',
      render: (value) => (
        <img 
          src={value || '/default-avatar.png'} 
          alt="Foto del estudiante"
          className={styles.studentPhoto}
        />
      )
    },
    {
      key: 'firstName',
      title: 'Nombre',
      sortable: true,
      render: (value, item) => (
        <div className={styles.studentName}>
          <span className={styles.fullName}>
            {`${item.firstName} ${item.lastName}`}
          </span>
          <span className={styles.studentCode}>
            {item.studentCode || 'Sin código'}
          </span>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (value) => value || 'No especificado'
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (value) => value || 'No especificado'
    },
    {
      key: 'instructorName',
      title: 'Instructor',
      sortable: true,
      render: (value) => value || 'Sin asignar'
    },
    {
      key: 'level',
      title: 'Nivel',
      sortable: true,
      render: (value) => (
        <span className={`${styles.levelBadge} ${styles[`level${value}`]}`}>
          Nivel {value || '1'}
        </span>
      )
    },
    {
      key: 'progress',
      title: 'Progreso',
      render: (value) => (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className={styles.progressText}>{value || 0}%</span>
        </div>
      )
    },
    {
      key: 'baptized',
      title: 'Bautizado',
      sortable: true,
      render: (value) => (
        <span className={`${styles.baptismBadge} ${value ? styles.baptized : styles.notBaptized}`}>
          {value ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      sortable: true,
      render: (value) => (
        <span className={`${styles.statusBadge} ${styles[value]}`}>
          {value === 'active' ? 'Activo' : 
           value === 'graduated' ? 'Graduado' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'startDate',
      title: 'Fecha Inicio',
      sortable: true,
      type: 'date'
    }
  ], []);

  // Manejadores de eventos
  const handleSearch = () => {
    loadStudents(1);
  };

  const handleSort = (field, order) => {
    setSortConfig({ field, order });
  };

  const handlePageChange = (page) => {
    loadStudents(page);
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student) => {
    setDeleteTarget({ type: 'single', student });
    setShowDeleteModal(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedStudents.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Advertencia',
        message: 'Selecciona al menos un estudiante para eliminar'
      });
      return;
    }

    setDeleteTarget({ type: 'multiple', students: selectedStudents });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'single') {
        await deleteStudent(deleteTarget.student.id);
      } else {
        await deleteMultipleStudents(deleteTarget.students);
        setSelectedStudents([]);
      }
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await loadStudents(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting student(s):', error);
    }
  };

  const handleStatusChange = async (student, newStatus) => {
    try {
      await updateStudentStatus(student.id, newStatus);
      await loadStudents(pagination.currentPage);
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const handleLevelChange = async (student, newLevel) => {
    try {
      await updateStudentLevel(student.id, newLevel);
      await loadStudents(pagination.currentPage);
    } catch (error) {
      console.error('Error updating student level:', error);
    }
  };

  const handleViewProgress = (student) => {
    setSelectedStudent(student);
    setShowProgressModal(true);
  };

  const handleMarkBaptized = (student) => {
    setSelectedStudent(student);
    setShowBaptismModal(true);
  };

  const handleConvertToMember = (student) => {
    setSelectedStudent(student);
    setShowConvertModal(true);
  };

  const handleGraduate = async (student) => {
    try {
      await graduateStudent(student.id, {
        graduationDate: new Date().toISOString().split('T')[0],
        notes: 'Graduación automática'
      });
      await loadStudents(pagination.currentPage);
    } catch (error) {
      console.error('Error graduating student:', error);
    }
  };

  const handleSendReminder = async (student) => {
    try {
      await sendReminder(student.id, {
        type: 'study_reminder',
        message: 'Recordatorio de estudio bíblico'
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportToExcel({ ...filters, search: searchTerm });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF({ ...filters, search: searchTerm });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const handleImport = async (file) => {
    try {
      await importFromExcel(file);
      setShowImportModal(false);
      await loadStudents(1);
    } catch (error) {
      console.error('Error importing students:', error);
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    return {
      total: pagination.total,
      active: students.filter(s => s.status === 'active').length,
      baptized: students.filter(s => s.baptized).length,
      graduated: students.filter(s => s.status === 'graduated').length,
      averageProgress: Math.round(
        students.reduce((sum, s) => sum + (s.progress || 0), 0) / 
        (students.length || 1)
      )
    };
  }, [students, pagination.total]);

  // Verificar permisos
  const canCreate = ['administrador', 'director', 'lider'].includes(user?.role);
  const canEdit = ['administrador', 'director', 'lider'].includes(user?.role);
  const canDelete = ['administrador', 'director'].includes(user?.role);
  const canExport = true; // Todos pueden exportar
  const canImport = ['administrador', 'director'].includes(user?.role);
  const canBaptize = ['administrador', 'director', 'lider'].includes(user?.role);
  const canConvert = ['administrador', 'director'].includes(user?.role);
  const canGraduate = ['administrador', 'director', 'lider'].includes(user?.role);

  return (
    <div className={styles.studentsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            <FaUserGraduate className={styles.titleIcon} />
            Estudiantes Bíblicos
          </h1>
          <p className={styles.pageDescription}>
            Administra los estudiantes bíblicos y su progreso académico
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <FaUserGraduate className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FaBook className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.active}</span>
              <span className={styles.statLabel}>Activos</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FaTrophy className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.baptized}</span>
              <span className={styles.statLabel}>Bautizados</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FaGraduationCap className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.graduated}</span>
              <span className={styles.statLabel}>Graduados</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <FaChartLine className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.averageProgress}%</span>
              <span className={styles.statLabel}>Progreso Promedio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Búsqueda */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <Button
              variant="primary"
              size="small"
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actionsSection}>
          {/* Filtros */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="graduated">Graduados</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">Todos los niveles</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3">Nivel 3</option>
            <option value="4">Nivel 4</option>
          </select>

          <select
            value={filters.baptized}
            onChange={(e) => setFilters(prev => ({ ...prev, baptized: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">Todos</option>
            <option value="true">Bautizados</option>
            <option value="false">No Bautizados</option>
          </select>

          {/* Acciones de exportación */}
          {canExport && (
            <>
              <Button
                variant="outline"
                size="small"
                onClick={handleExportExcel}
                disabled={loading}
              >
                <FaDownload /> Excel
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={handleExportPDF}
                disabled={loading}
              >
                <FaDownload /> PDF
              </Button>
            </>
          )}

          {/* Importar */}
          {canImport && (
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowImportModal(true)}
            >
              <FaUpload /> Importar
            </Button>
          )}

          {/* Eliminar múltiples */}
          {canDelete && selectedStudents.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDeleteMultiple}
            >
              <FaTrash /> Eliminar ({selectedStudents.length})
            </Button>
          )}

          {/* Crear nuevo */}
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Nuevo Estudiante
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={students}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onView={handleView}
        selectedRows={selectedStudents}
        onRowSelect={setSelectedStudents}
        selectable={canDelete}
        actions={[
          'view',
          ...(canEdit ? ['edit'] : []),
          ...(canDelete ? ['delete'] : [])
        ]}
        customActions={(student) => (
          <div className={styles.customActions}>
            <Button
              variant="outline"
              size="small"
              onClick={() => handleViewProgress(student)}
              title="Ver progreso"
            >
              <FaChartLine />
            </Button>
            {canBaptize && !student.baptized && (
              <Button
                variant="success"
                size="small"
                onClick={() => handleMarkBaptized(student)}
                title="Marcar como bautizado"
              >
                <FaTrophy />
              </Button>
            )}
            {canGraduate && student.status === 'active' && student.progress >= 80 && (
              <Button
                variant="warning"
                size="small"
                onClick={() => handleGraduate(student)}
                title="Graduar estudiante"
              >
                <FaGraduationCap />
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleSendReminder(student)}
              title="Enviar recordatorio"
            >
              <FaBell />
            </Button>
          </div>
        )}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div className={styles.deleteModalContent}>
            <p>
              {deleteTarget?.type === 'single' 
                ? `¿Estás seguro de que quieres eliminar al estudiante "${deleteTarget.student.firstName} ${deleteTarget.student.lastName}"?`
                : `¿Estás seguro de que quieres eliminar ${deleteTarget?.students?.length} estudiante(s) seleccionado(s)?`
              }
            </p>
            <p className={styles.warningText}>
              Esta acción no se puede deshacer y se perderá todo el progreso del estudiante.
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={loading}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Aquí irían los otros modales: Create, Edit, View, Progress, Baptism, Convert, Import */}
      {/* Los implementaremos en el siguiente paso si es necesario */}
    </div>
  );
};


export default BiblicalStudents;