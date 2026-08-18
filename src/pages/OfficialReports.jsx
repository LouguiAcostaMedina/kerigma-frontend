/**
 * Página de Reportes Oficiales de Membresía
 * Certificados (bautismo, recomendación) + exportación CSV de lista de miembros
 */

import { useState, useCallback } from 'react';
import { FaFilePdf, FaFileCsv, FaSearch, FaUser, FaCertificate, FaEnvelope } from 'react-icons/fa';
import Loading from '@/components/common/Loading';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { officialReportService } from '@/services/officialReportService';
import { generateBaptismCertificate, generateRecommendationLetter, exportMembersToCsv } from '@/utils/memberDocuments';
import { showToast } from '@/utils/notifications';
import styles from './OfficialReports.module.css';

const OfficialReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [allMembersLoading, setAllMembersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('certificates');

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      showToast('Ingrese un término de búsqueda', 'error');
      return;
    }
    setSearchLoading(true);
    try {
      const data = await officialReportService.searchMembers({
        search: searchTerm.trim(),
        limit: 20,
        page: 1,
      });
      const members = data?.data || data?.members || [];
      setSearchResults(members);
      if (members.length === 0) {
        showToast('No se encontraron miembros', 'info');
      }
    } catch (error) {
      console.error('Error searching members:', error);
      showToast('Error al buscar miembros', 'error');
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleExportBaptism = () => {
    if (!selectedMember) return;
    if (!selectedMember.baptized) {
      showToast('Este miembro no tiene registro de bautismo', 'error');
      return;
    }
    generateBaptismCertificate(selectedMember);
    showToast('Certificado de bautismo generado', 'success');
    setShowMemberModal(false);
  };

  const handleExportRecommendation = () => {
    if (!selectedMember) return;
    generateRecommendationLetter(selectedMember);
    showToast('Carta de recomendación generada', 'success');
    setShowMemberModal(false);
  };

  const handleExportAllCsv = async () => {
    setAllMembersLoading(true);
    try {
      const data = await officialReportService.getMemberList({ limit: 1000, page: 1 });
      const members = data?.data || data?.members || [];
      if (members.length === 0) {
        showToast('No hay miembros para exportar', 'info');
        return;
      }
      exportMembersToCsv(members);
      showToast(`CSV exportado: ${members.length} miembros`, 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Error al exportar CSV', 'error');
    } finally {
      setAllMembersLoading(false);
    }
  };

  const columns = [
    { key: 'firstName', title: 'Nombre' },
    { key: 'lastName', title: 'Apellido' },
    { key: 'email', title: 'Email' },
    { key: 'groupName', title: 'Grupo' },
    {
      key: 'status',
      title: 'Estado',
      render: (value) => (
        <span className={`${styles.statusBadge} ${styles[value] || ''}`}>
          {value === 'active' ? 'Activo' : value === 'inactive' ? 'Inactivo' : value}
        </span>
      ),
    },
    {
      key: 'baptized',
      title: 'Bautizado',
      render: (value) => value ? <span className={styles.yesBadge}>Sí</span> : <span className={styles.noBadge}>No</span>,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes Oficiales de Membresía</h1>
          <p className={styles.subtitle}>
            Certificados de bautismo, cartas de recomendación y exportación de datos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'certificates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <FaCertificate /> Certificados
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'export' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <FaFileCsv /> Exportar Lista
        </button>
      </div>

      {activeTab === 'certificates' && (
        <>
          {/* Búsqueda de miembro */}
          <div className={styles.searchSection}>
            <h2 className={styles.sectionTitle}>Buscar Miembro</h2>
            <div className={styles.searchBar}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre, apellido, email o teléfono..."
                className={styles.searchInput}
              />
              <button onClick={handleSearch} disabled={searchLoading} className={styles.searchButton}>
                {searchLoading ? 'Buscando...' : <><FaSearch /> Buscar</>}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className={styles.resultsTable}>
                <DataTable
                  data={searchResults}
                  columns={columns}
                  loading={searchLoading}
                  searchable={false}
                  actions={['view']}
                  onView={handleSelectMember}
                />
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'export' && (
        <div className={styles.exportSection}>
          <h2 className={styles.sectionTitle}>Exportar Lista de Miembros</h2>
          <p className={styles.exportDescription}>
            Descargue la lista completa de miembros en formato CSV compatible con Excel y otras herramientas.
          </p>
          <button
            onClick={handleExportAllCsv}
            disabled={allMembersLoading}
            className={styles.exportCsvButton}
          >
            {allMembersLoading ? 'Exportando...' : <><FaFileCsv /> Descargar CSV</>}
          </button>
        </div>
      )}

      {/* Modal de detalles del miembro */}
      {showMemberModal && selectedMember && (
        <Modal onClose={() => setShowMemberModal(false)} title="Generar Documento Oficial">
          <div className={styles.memberDetail}>
            <div className={styles.memberAvatar}>
              <FaUser className={styles.avatarIcon} />
            </div>
            <h3 className={styles.memberName}>{selectedMember.firstName} {selectedMember.lastName}</h3>
            <div className={styles.memberInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span>{selectedMember.email || 'N/D'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Grupo:</span>
                <span>{selectedMember.groupName || 'N/D'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Estado:</span>
                <span>{selectedMember.status}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Bautizado:</span>
                <span>{selectedMember.baptized ? `Sí (${selectedMember.baptismDate || 'sin fecha'})` : 'No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fecha ingreso:</span>
                <span>{selectedMember.joinDate || 'N/D'}</span>
              </div>
            </div>

            <div className={styles.documentActions}>
              <button
                onClick={handleExportBaptism}
                disabled={!selectedMember.baptized}
                className={styles.docButton}
                title={!selectedMember.baptized ? 'Miembro no bautizado' : 'Generar certificado de bautismo'}
              >
                <FaFilePdf /> Certificado de Bautismo
              </button>
              <button onClick={handleExportRecommendation} className={styles.docButton}>
                <FaEnvelope /> Carta de Recomendación
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OfficialReports;
