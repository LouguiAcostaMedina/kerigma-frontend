/**
 * Componente de Tabla de Datos Reutilizable
 * Tabla genérica con funcionalidades de ordenación, filtrado, paginación y acciones
 */

import { useState, useMemo } from 'react';
import { 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import Loading from './Loading';
import PropTypes from 'prop-types';
import styles from './DataTable.module.css';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onSort = null,
  onPageChange = null,
  onEdit = null,
  onDelete = null,
  onView = null,
  selectedRows = [],
  onRowSelect = null,
  actions = ['view', 'edit', 'delete'],
  searchable = true,
  selectable = false,
  className = ''
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtrar datos localmente si no hay paginación del servidor
  const filteredData = useMemo(() => {
    if (!searchable || !localSearch || pagination) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        value && value.toString().toLowerCase().includes(localSearch.toLowerCase())
      )
    );
  }, [data, localSearch, searchable, pagination]);

  // Ordenar datos localmente si no hay ordenación del servidor
  const sortedData = useMemo(() => {
    if (!sortConfig.key || onSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, onSort]);

  // Manejar ordenación
  const handleSort = (columnKey) => {
    if (onSort) {
      // Ordenación del servidor
      const direction = sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      setSortConfig({ key: columnKey, direction });
      onSort(columnKey, direction);
    } else {
      // Ordenación local
      setSortConfig(current => ({
        key: columnKey,
        direction: current.key === columnKey && current.direction === 'asc' ? 'desc' : 'asc'
      }));
    }
  };

  // Obtener icono de ordenación
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Manejar selección de fila
  const handleRowSelect = (rowId, checked) => {
    if (!onRowSelect) return;
    
    if (checked) {
      onRowSelect([...selectedRows, rowId]);
    } else {
      onRowSelect(selectedRows.filter(id => id !== rowId));
    }
  };

  // Manejar selección de todas las filas
  const handleSelectAll = (checked) => {
    if (!onRowSelect) return;
    
    if (checked) {
      const allIds = sortedData.map(item => item.id);
      onRowSelect(allIds);
    } else {
      onRowSelect([]);
    }
  };

  // Renderizar valor de celda
  const renderCellValue = (item, column) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    if (column.type === 'boolean') {
      return value ? <FaCheck className={styles.booleanTrue} /> : <FaTimes className={styles.booleanFalse} />;
    }
    
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-ES');
    }
    
    if (column.type === 'currency' && value) {
      return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'PEN' 
      }).format(value);
    }
    
    return value || '-';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      {/* Header con búsqueda */}
      {searchable && !pagination && (
        <div className={styles.tableHeader}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar en la tabla..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {/* Columna de selección */}
              {selectable && (
                <th className={styles.selectColumn}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className={styles.checkbox}
                  />
                </th>
              )}
              
              {/* Columnas de datos */}
              {columns.map(column => (
                <th 
                  key={column.key}
                  className={`${styles.tableHeader} ${column.sortable ? styles.sortable : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={styles.headerContent}>
                    <span>{column.title}</span>
                    {column.sortable && (
                      <span className={styles.sortIcon}>
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Columna de acciones */}
              {actions.length > 0 && (
                <th className={styles.actionsColumn}>Acciones</th>
              )}
            </tr>
          </thead>
          
          <tbody className={styles.tableBody}>
            {sortedData.length > 0 ? (
              sortedData.map(item => (
                <tr key={item.id} className={styles.tableRow}>
                  {/* Celda de selección */}
                  {selectable && (
                    <td className={styles.selectCell}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                        className={styles.checkbox}
                      />
                    </td>
                  )}
                  
                  {/* Celdas de datos */}
                  {columns.map(column => (
                    <td key={column.key} className={styles.tableCell}>
                      {renderCellValue(item, column)}
                    </td>
                  ))}
                  
                  {/* Celda de acciones */}
                  {actions.length > 0 && (
                    <td className={styles.actionsCell}>
                      <div className={styles.actionsGroup}>
                        {actions.includes('view') && onView && (
                          <button
                            onClick={() => onView(item)}
                            className={`${styles.actionButton} ${styles.viewButton}`}
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>
                        )}
                        {actions.includes('edit') && onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {actions.includes('delete') && onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className={styles.emptyCell}
                >
                  No se encontraron datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Mostrando {pagination.from} - {pagination.to} de {pagination.total} resultados
          </div>
          
          <div className={styles.paginationControls}>
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={styles.paginationButton}
            >
              <FaChevronLeft />
            </button>
            
            <span className={styles.pageInfo}>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={styles.paginationButton}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'number', 'date', 'boolean', 'currency']),
    render: PropTypes.func
  })),
  loading: PropTypes.bool,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    from: PropTypes.number,
    to: PropTypes.number,
    total: PropTypes.number
  }),
  onSort: PropTypes.func,
  onPageChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  actions: PropTypes.array,
  searchable: PropTypes.bool,
  selectable: PropTypes.bool,
  className: PropTypes.string
};

export default DataTable;