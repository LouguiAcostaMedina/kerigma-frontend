import { useState, useEffect, useMemo } from 'react';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import styles from './Hierarchy.module.css';

const TABS = [
  { key: 'associations', label: 'Asociaciones' },
  { key: 'districts', label: 'Distritos' },
];

const EMPTY_ASSOC = { name: '', code: '', description: '', territory: '', phone: '', email: '', country: '' };
const EMPTY_DISTRICT = { name: '', code: '', description: '', associationId: '', territory: '', phone: '', email: '' };

const Hierarchy = () => {
  const [tab, setTab] = useState('associations');
  const [associations, setAssociations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterAssoc, setFilterAssoc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_ASSOC);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, dRes] = await Promise.all([
        fetch('/api/associations').then(r => r.ok ? r.json() : []),
        fetch('/api/districts').then(r => r.ok ? r.json() : []),
      ]);
      setAssociations(Array.isArray(aRes) ? aRes : aRes.data || []);
      setDistricts(Array.isArray(dRes) ? dRes : dRes.data || []);
    } catch {
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssoc = useMemo(() => {
    if (!search) return associations;
    const q = search.toLowerCase();
    return associations.filter(a => a.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q));
  }, [associations, search]);

  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (filterAssoc) list = list.filter(d => d.associationId === filterAssoc);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q));
    }
    return list;
  }, [districts, filterAssoc, search]);

  const assocColumns = useMemo(() => [
    { key: 'name', title: 'Nombre', sortable: true },
    { key: 'code', title: 'Código', sortable: true },
    { key: 'territory', title: 'Territorio' },
    { key: 'country', title: 'País' },
    { key: 'phone', title: 'Teléfono' },
    { key: 'email', title: 'Email' },
  ], []);

  const districtColumns = useMemo(() => [
    { key: 'name', title: 'Nombre', sortable: true },
    { key: 'code', title: 'Código', sortable: true },
    { key: 'territory', title: 'Territorio' },
    { key: 'phone', title: 'Teléfono' },
    { key: 'email', title: 'Email' },
    {
      key: 'associationId',
      title: 'Asociación',
      render: (val) => associations.find(a => a.id === val)?.name || '—',
    },
  ], [associations]);

  const openCreate = () => {
    setForm(tab === 'associations' ? EMPTY_ASSOC : EMPTY_DISTRICT);
    setModalMode('create');
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setModalMode('edit');
    setSelected(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const endpoint = tab === 'associations' ? 'associations' : 'districts';
    try {
      await fetch(`/api/${endpoint}/${deleteTarget.id}`, { method: 'DELETE' });
      showToast('Eliminado correctamente', 'success');
      loadData();
    } catch {
      showToast('Error al eliminar', 'error');
    }
    setShowDelete(false);
    setDeleteTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = tab === 'associations' ? 'associations' : 'districts';
    const isEdit = modalMode === 'edit';
    try {
      const url = isEdit ? `/api/${endpoint}/${selected.id}` : `/api/${endpoint}`;
      await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      showToast(isEdit ? 'Actualizado correctamente' : 'Creado correctamente', 'success');
      setShowModal(false);
      loadData();
    } catch {
      showToast('Error al guardar', 'error');
    }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <Loading message="Cargando jerarquía..." />;

  const currentData = tab === 'associations' ? filteredAssoc : filteredDistricts;
  const columns = tab === 'associations' ? assocColumns : districtColumns;
  const formFields = tab === 'associations' ? ['name', 'code', 'description', 'territory', 'country', 'phone', 'email'] : ['name', 'code', 'description', 'territory', 'phone', 'email'];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FaBuilding className={styles.titleIcon} /> Jerarquía Organizacional</h1>
        <p className={styles.subtitle}>Gestiona asociaciones y distritos de la iglesia</p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
            onClick={() => { setTab(t.key); setSearch(''); setFilterAssoc(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder={`Buscar ${tab === 'associations' ? 'asociaciones' : 'distritos'}...`}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {tab === 'districts' && (
          <select className={styles.filterSelect} value={filterAssoc} onChange={e => setFilterAssoc(e.target.value)}>
            <option value="">Todas las asociaciones</option>
            {associations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <button className={styles.addBtn} onClick={openCreate}><FaPlus /> Nuevo</button>
      </div>

      <DataTable data={currentData} columns={columns}
        onEdit={openEdit} onDelete={handleDelete} actions={['edit', 'delete']} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Crear Nuevo' : 'Editar'} size="medium">
        <form className={styles.form} onSubmit={handleSubmit}>
          {formFields.map(field => (
            <div className={styles.formGroup} key={field}>
              <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              {field === 'description' ? (
                <textarea className={styles.textarea} value={form[field] || ''} onChange={e => handleChange(field, e.target.value)} rows={3} />
              ) : (
                <input className={styles.input} type={field === 'email' ? 'email' : 'text'}
                  value={form[field] || ''} onChange={e => handleChange(field, e.target.value)} required={field === 'name' || field === 'code'} />
              )}
            </div>
          ))}
          {tab === 'districts' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Asociación</label>
              <select className={styles.select} value={form.associationId || ''} onChange={e => handleChange('associationId', e.target.value)} required>
                <option value="">Seleccionar asociación</option>
                {associations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{modalMode === 'create' ? 'Crear' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Confirmar Eliminación" size="small">
        <p className={styles.deleteMsg}>¿Eliminar "{deleteTarget?.name}"? Esta acción no se puede deshacer.</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={() => setShowDelete(false)}>Cancelar</button>
          <button className={styles.deleteBtn} onClick={confirmDelete}><FaTrash /> Eliminar</button>
        </div>
      </Modal>
    </div>
  );
};

export default Hierarchy;
