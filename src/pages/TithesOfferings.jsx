/**
 * Página de Diezmos y Ofrendas
 * Registro de aportes por miembro, historial y reportes financieros por categoría/periodo
 */

import { useState, useEffect, useCallback } from 'react';
import { FaHandHoldingHeart, FaPlus, FaFilter, FaCalendarAlt, FaChartBar, FaSearch, FaTrash, FaEye } from 'react-icons/fa';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import { financialService } from '@/services/financialService';
import { showToast } from '@/utils/notifications';
import styles from './TithesOfferings.module.css';

const CATEGORY_LABELS = {
  diezmo: 'Diezmo',
  ofrenda_misionera: 'Ofrenda Misionera',
  escuela_sabatica: 'Escuela Sabática',
  proyectos_especiales: 'Proyectos Especiales',
  otros: 'Otros',
};

const CATEGORY_COLORS = {
  diezmo: '#22c55e',
  ofrenda_misionera: '#3b82f6',
  escuela_sabatica: '#f59e0b',
  proyectos_especiales: '#8b5cf6',
  otros: '#6b7280',
};

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
];

const EMPTY_FORM = {
  memberId: '',
  category: 'diezmo',
  amount: '',
  period: new Date().toISOString().slice(0, 7),
  paymentMethod: 'efectivo',
  notes: '',
};

const TithesOfferings = () => {
  const [contributions, setContributions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState([]);
  const [periodSummary, setPeriodSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', period: '', page: 1, limit: 20 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.period) params.period = filters.period;
      params.page = filters.page;
      params.limit = filters.limit;

      const [contribsData, summaryData, periodData] = await Promise.all([
        financialService.getContributions(params),
        financialService.getSummaryByCategory({ period: filters.period || undefined }),
        financialService.getSummaryByPeriod(),
      ]);

      setContributions(contribsData.data || []);
      setPagination({
        currentPage: contribsData.currentPage,
        totalPages: contribsData.totalPages,
        total: contribsData.total,
        from: contribsData.from,
        to: contribsData.to,
      });
      setSummary(summaryData || []);
      setPeriodSummary(periodData || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
      showToast('Error al cargar los datos financieros', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount || Number(formData.amount) <= 0) {
      showToast('Complete todos los campos requeridos', 'error');
      return;
    }

    setFormLoading(true);
    try {
      await financialService.createContribution({
        ...formData,
        amount: Number(formData.amount),
      });
      showToast('Contribución registrada correctamente', 'success');
      setShowCreateModal(false);
      setFormData(EMPTY_FORM);
      loadData();
    } catch (error) {
      console.error('Error creating contribution:', error);
      showToast(error?.message || 'Error al registrar la contribución', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta contribución?')) return;
    try {
      await financialService.deleteContribution(id);
      showToast('Contribución eliminada', 'success');
      loadData();
    } catch {
      showToast('Error al eliminar la contribución', 'error');
    }
  };

  const handleViewDetail = (item) => {
    setSelectedContribution(item);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  };

  const columns = [
    {
      key: 'createdAt',
      title: 'Fecha',
      type: 'date',
      render: (value) => new Date(value).toLocaleDateString('es-PE'),
    },
    {
      key: 'memberName',
      title: 'Miembro',
    },
    {
      key: 'category',
      title: 'Categoría',
      render: (value) => (
        <span className={styles.categoryBadge} style={{ backgroundColor: `${CATEGORY_COLORS[value]}20`, color: CATEGORY_COLORS[value] }}>
          {CATEGORY_LABELS[value] || value}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Monto',
      render: (value) => <span className={styles.amountCell}>{formatCurrency(value)}</span>,
    },
    {
      key: 'period',
      title: 'Período',
    },
    {
      key: 'paymentMethod',
      title: 'Método',
      render: (value) => PAYMENT_METHODS.find((m) => m.value === value)?.label || value,
    },
  ];

  const totalAmount = summary.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Diezmos y Ofrendas"
        subtitle="Registro de aportes financieros por miembro"
        icon={<FaHandHoldingHeart />}
        actionButton={
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Nueva Contribución
          </button>
        }
      />

      {/* Resumen */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{formatCurrency(totalAmount)}</div>
          <div className={styles.summaryLabel}>Total general</div>
        </div>
        {summary.slice(0, 4).map((item) => (
          <div key={item.category} className={styles.summaryCard}>
            <div className={styles.summaryValue}>{formatCurrency(item.total)}</div>
            <div className={styles.summaryLabel}>{CATEGORY_LABELS[item.category] || item.category}</div>
            <div className={styles.summaryCount}>{item.count} registros</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <FaFilter className={styles.filterIcon} />
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
            className={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <FaCalendarAlt className={styles.filterIcon} />
          <input
            type="month"
            value={filters.period}
            onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value, page: 1 }))}
            className={styles.filterInput}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <DataTable
          data={contributions}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          actions={['view', 'delete']}
          onView={handleViewDetail}
          onDelete={(item) => handleDelete(item.id)}
          searchable={false}
        />
      </div>

      {/* Resumen por período */}
      {periodSummary.length > 0 && (
        <div className={styles.periodSection}>
          <h3 className={styles.sectionTitle}><FaChartBar /> Resumen por Período</h3>
          <div className={styles.periodGrid}>
            {periodSummary.slice(0, 6).map((item) => (
              <div key={item.period} className={styles.periodCard}>
                <div className={styles.periodName}>{item.period}</div>
                <div className={styles.periodTotal}>{formatCurrency(item.total)}</div>
                <div className={styles.periodCount}>{item.count} contribuciones</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title="Nueva Contribución">
          <form onSubmit={handleCreate} className={styles.createForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ID del Miembro *</label>
              <input
                type="text"
                value={formData.memberId}
                onChange={(e) => setFormData((prev) => ({ ...prev, memberId: e.target.value }))}
                placeholder="UUID del miembro"
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className={styles.formSelect}
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Monto (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Período (YYYY-MM) *</label>
              <input
                type="month"
                value={formData.period}
                onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value }))}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Método de pago</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className={styles.formSelect}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales..."
                className={styles.formTextarea}
                rows={3}
              />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button type="submit" className={styles.submitButton} disabled={formLoading}>
                {formLoading ? 'Registrando...' : 'Registrar Contribución'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedContribution && (
        <Modal onClose={() => setShowDetailModal(false)} title="Detalle de Contribución">
          <div className={styles.detailContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fecha:</span>
              <span>{new Date(selectedContribution.createdAt).toLocaleDateString('es-PE')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Miembro:</span>
              <span>{selectedContribution.memberName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Categoría:</span>
              <span className={styles.categoryBadge} style={{ backgroundColor: `${CATEGORY_COLORS[selectedContribution.category]}20`, color: CATEGORY_COLORS[selectedContribution.category] }}>
                {CATEGORY_LABELS[selectedContribution.category]}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Monto:</span>
              <span className={styles.amountCell}>{formatCurrency(selectedContribution.amount)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Período:</span>
              <span>{selectedContribution.period}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Método:</span>
              <span>{PAYMENT_METHODS.find((m) => m.value === selectedContribution.paymentMethod)?.label}</span>
            </div>
            {selectedContribution.receiptNumber && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>N° Comprobante:</span>
                <span>{selectedContribution.receiptNumber}</span>
              </div>
            )}
            {selectedContribution.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Notas:</span>
                <span>{selectedContribution.notes}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Registrado por:</span>
              <span>{selectedContribution.recordedByName}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TithesOfferings;
