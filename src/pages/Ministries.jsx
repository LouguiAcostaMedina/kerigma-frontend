import { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaHandsHelping, FaUsers, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from './Ministries.module.css';

const CATEGORIES = ['worship', 'education', 'outreach', 'service', 'music', 'youth', 'children', 'other'];
const CATEGORY_LABELS = { worship: 'Adoración', education: 'Educación', outreach: 'Evangelismo', service: 'Servicio', music: 'Música', youth: 'Jóvenes', children: 'Niños', other: 'Otro' };
const EMPTY_MINISTRY = { name: '', description: '', category: 'other', leaderId: '', meetingSchedule: '' };
const EMPTY_ASSIGN = { memberId: '', role: '', notes: '' };

const Ministries = () => {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_MINISTRY);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailMinistry, setDetailMinistry] = useState(null);
  const [members, setMembers] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ministries');
      const data = await res.json();
      setMinistries(Array.isArray(data) ? data : data.data || []);
    } catch {
      showToast('Error al cargar ministerios', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    if (!search) return ministries;
    const q = search.toLowerCase();
    return ministries.filter(m => m.name?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q));
  }, [ministries, search]);

  const columns = useMemo(() => [
    { key: 'name', title: 'Nombre', sortable: true },
    { key: 'category', title: 'Categoría', sortable: true, render: (v) => <span className={styles.catBadge}>{CATEGORY_LABELS[v] || v}</span> },
    { key: 'leaderName', title: 'Líder', render: (v) => v || 'Sin asignar' },
    { key: 'assignmentCount', title: 'Asignados', render: (v) => <span className={styles.countBadge}>{v || 0}</span> },
    { key: 'meetingSchedule', title: 'Horario' },
  ], []);

  const openCreate = () => { setForm(EMPTY_MINISTRY); setModalMode('create'); setSelected(null); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setModalMode('edit'); setSelected(item); setShowModal(true); };
  const openDetail = async (item) => {
    setDetailMinistry(item);
    try {
      const res = await fetch(`/api/ministries/${item.id}/members`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : data.data || []);
    } catch { setMembers([]); }
    setShowDetail(true);
  };

  const handleDelete = (item) => { setDeleteTarget(item); setShowDelete(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/ministries/${deleteTarget.id}`, { method: 'DELETE' });
      showToast('Ministerio eliminado', 'success');
      loadData();
    } catch { showToast('Error al eliminar', 'error'); }
    setShowDelete(false); setDeleteTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = modalMode === 'edit';
    try {
      const url = isEdit ? `/api/ministries/${selected.id}` : '/api/ministries';
      await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      showToast(isEdit ? 'Actualizado' : 'Creado correctamente', 'success');
      setShowModal(false); loadData();
    } catch { showToast('Error al guardar', 'error'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/ministries/${detailMinistry.id}/assign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assignForm),
      });
      showToast('Miembro asignado', 'success');
      setShowAssign(false); setAssignForm(EMPTY_ASSIGN);
      const res = await fetch(`/api/ministries/${detailMinistry.id}/members`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : data.data || []);
    } catch { showToast('Error al asignar', 'error'); }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <Loading message="Cargando ministerios..." />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FaHandsHelping className={styles.titleIcon} /> Ministerios</h1>
        <p className={styles.subtitle}>Gestiona ministerios y voluntarios de la iglesia</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input className={styles.searchInput} placeholder="Buscar ministerios..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className={styles.addBtn} onClick={openCreate}><FaPlus /> Nuevo Ministerio</button>
      </div>

      <DataTable data={filtered} columns={columns}
        onView={openDetail} onEdit={openEdit} onDelete={handleDelete}
        actions={['view', 'edit', 'delete']} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nuevo Ministerio' : 'Editar Ministerio'} size="medium">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre</label>
            <input className={styles.input} value={form.name || ''} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea className={styles.textarea} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Categoría</label>
              <select className={styles.select} value={form.category || 'other'} onChange={e => handleChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Horario de Reunión</label>
              <input className={styles.input} value={form.meetingSchedule || ''} onChange={e => handleChange('meetingSchedule', e.target.value)} placeholder="Ej: Domingos 10:00 AM" />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{modalMode === 'create' ? 'Crear' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setMembers([]); }}
        title={`Ministerio: ${detailMinistry?.name || ''}`} size="large">
        <div className={styles.detailContent}>
          <div className={styles.detailInfo}>
            <p><strong>Categoría:</strong> {CATEGORY_LABELS[detailMinistry?.category] || detailMinistry?.category}</p>
            <p><strong>Horario:</strong> {detailMinistry?.meetingSchedule || 'No definido'}</p>
            <p><strong>Descripción:</strong> {detailMinistry?.description || 'Sin descripción'}</p>
          </div>
          <div className={styles.membersHeader}>
            <h3><FaUsers /> Miembros Asignados ({members.length})</h3>
            <button className={styles.addBtn} onClick={() => setShowAssign(true)}><FaPlus /> Asignar</button>
          </div>
          {members.length === 0 ? (
            <p className={styles.emptyMsg}>No hay miembros asignados</p>
          ) : (
            <div className={styles.membersList}>
              {members.map(m => (
                <div key={m.id} className={styles.memberItem}>
                  <span className={styles.memberName}>{m.memberName || m.name}</span>
                  <span className={styles.memberRole}>{m.role || 'Miembro'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Asignar Miembro" size="small">
        <form className={styles.form} onSubmit={handleAssign}>
          <div className={styles.formGroup}>
            <label className={styles.label}>ID del Miembro</label>
            <input className={styles.input} value={assignForm.memberId || ''} onChange={e => setAssignForm(p => ({ ...p, memberId: e.target.value }))} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Rol</label>
            <input className={styles.input} value={assignForm.role || ''} onChange={e => setAssignForm(p => ({ ...p, role: e.target.value }))} placeholder="Ej: Líder, Coordinador" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notas</label>
            <textarea className={styles.textarea} value={assignForm.notes || ''} onChange={e => setAssignForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowAssign(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>Asignar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Confirmar Eliminación" size="small">
        <p className={styles.deleteMsg}>¿Eliminar ministerio "{deleteTarget?.name}"?</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={() => setShowDelete(false)}>Cancelar</button>
          <button className={styles.deleteBtn} onClick={confirmDelete}><FaTrash /> Eliminar</button>
        </div>
      </Modal>
    </div>
  );
};

export default Ministries;
