import { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaFolderOpen, FaFile, FaUpload, FaFilter, FaSearch } from 'react-icons/fa';
import styles from './ChurchDocuments.module.css';

const CATEGORIES = ['policy', 'certificate', 'report', 'photo', 'video', 'audio', 'template', 'other'];
const CATEGORY_LABELS = { policy: 'Política', certificate: 'Certificado', report: 'Reporte', photo: 'Foto', video: 'Video', audio: 'Audio', template: 'Plantilla', other: 'Otro' };
const EMPTY_DOC = { title: '', description: '', category: 'other', fileUrl: '', fileName: '', isPublic: false };

const ChurchDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_DOC);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/church-documents');
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data.data || []);
    } catch {
      showToast('Error al cargar documentos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    let list = documents;
    if (filterCat) list = list.filter(d => d.category === filterCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.title?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    }
    return list;
  }, [documents, search, filterCat]);

  const columns = useMemo(() => [
    {
      key: 'icon', title: '', width: 40,
      render: () => <FaFile className={styles.fileIcon} />,
    },
    { key: 'title', title: 'Título', sortable: true },
    {
      key: 'category', title: 'Categoría', sortable: true,
      render: (v) => <span className={styles.catBadge}>{CATEGORY_LABELS[v] || v}</span>,
    },
    { key: 'uploadedByName', title: 'Subido por', render: (v) => v || '—' },
    { key: 'createdAt', title: 'Fecha', sortable: true, type: 'date' },
    {
      key: 'isPublic', title: 'Visibilidad',
      render: (v) => <span className={`${styles.visBadge} ${v ? styles.public : styles.private}`}>{v ? 'Público' : 'Privado'}</span>,
    },
  ], []);

  const openCreate = () => { setForm({ ...EMPTY_DOC }); setShowModal(true); };

  const openDetail = (item) => { setSelected(item); setShowDetail(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/church-documents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      showToast('Documento registrado correctamente', 'success');
      setShowModal(false); loadData();
    } catch {
      showToast('Error al guardar', 'error');
    }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <Loading message="Cargando documentos..." />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FaFolderOpen className={styles.titleIcon} /> Repositorio de Documentos</h1>
        <p className={styles.subtitle}>Gestiona documentos de la iglesia</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Buscar documentos..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filterBox}>
          <FaFilter className={styles.filterIcon} />
          <select className={styles.filterSelect} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <button className={styles.addBtn} onClick={openCreate}><FaUpload /> Subir Documento</button>
      </div>

      <DataTable data={filtered} columns={columns} onView={openDetail} actions={['view']} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Subir Documento" size="medium">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Título</label>
            <input className={styles.input} value={form.title || ''} onChange={e => handleChange('title', e.target.value)} required />
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
              <label className={styles.label}>Nombre del Archivo</label>
              <input className={styles.input} value={form.fileName || ''} onChange={e => handleChange('fileName', e.target.value)} placeholder="Ej: documento.pdf" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>URL del Archivo</label>
            <input className={styles.input} value={form.fileUrl || ''} onChange={e => handleChange('fileUrl', e.target.value)} placeholder="https://..." />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={form.isPublic || false} onChange={e => handleChange('isPublic', e.target.checked)} />
              Documento público
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}><FaUpload /> Subir</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelected(null); }} title="Detalle del Documento" size="medium">
        {selected && (
          <div className={styles.detailContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Título:</span>
              <span className={styles.detailValue}>{selected.title}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Categoría:</span>
              <span className={styles.detailValue}>{CATEGORY_LABELS[selected.category] || selected.category}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Descripción:</span>
              <span className={styles.detailValue}>{selected.description || 'Sin descripción'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Archivo:</span>
              <span className={styles.detailValue}>{selected.fileName || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>URL:</span>
              <span className={styles.detailValue}>{selected.fileUrl || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Subido por:</span>
              <span className={styles.detailValue}>{selected.uploadedByName || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fecha:</span>
              <span className={styles.detailValue}>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Visibilidad:</span>
              <span className={`${styles.visBadge} ${selected.isPublic ? styles.public : styles.private}`}>
                {selected.isPublic ? 'Público' : 'Privado'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChurchDocuments;
