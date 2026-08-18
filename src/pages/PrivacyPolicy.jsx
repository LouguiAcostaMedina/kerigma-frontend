/**
 * Política de Privacidad - Ley N° 29733 de Protección de Datos Personales (Perú)
 */

import { FaShieldAlt, FaDatabase, FaUserShield, FaDownload, FaTrash, FaEnvelope } from 'react-icons/fa';
import { PageHeader } from '@/components/common/PageHeader';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Política de Privacidad"
        subtitle="Protección de Datos Personales - Ley N° 29733"
        icon={<FaShieldAlt />}
      />

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaDatabase className={styles.sectionIcon} />
            1. Datos que recopilamos
          </h2>
          <div className={styles.sectionContent}>
            <p>
              El Sistema de Gestión Misionera recopila únicamente los datos personales
              necesarios para la gestión de la membresía eclesiástica:
            </p>
            <ul>
              <li><strong>Datos de identificación:</strong> nombre, apellido, correo electrónico, teléfono</li>
              <li><strong>Datos demográficos:</strong> fecha de nacimiento, género, estado civil, dirección</li>
              <li><strong>Datos de membresía:</strong> grupo asignado, fecha de bautismo, estado espiritual, fecha de ingreso</li>
              <li><strong>Datos de contacto de emergencia:</strong> nombre y teléfono de contacto de emergencia</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaUserShield className={styles.sectionIcon} />
            2. Finalidad del tratamiento
          </h2>
          <div className={styles.sectionContent}>
            <p>Los datos personales son tratados exclusivamente para:</p>
            <ul>
              <li>Gestión administrativa de la membresía de la iglesia</li>
              <li>Registro de asistencia a actividades eclesiásticas</li>
              <li>Comunicación sobre actividades y eventos de la iglesia</li>
              <li>Generación de reportes internos de la congregación</li>
              <li>Cumplimiento de obligaciones internas de la organización</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaUserShield className={styles.sectionIcon} />
            3. Consentimiento
          </h2>
          <div className={styles.sectionContent}>
            <p>
              Al registrar un miembro en el sistema, se requiere el consentimiento
              informado del titular de los datos. El consentimiento debe ser:
            </p>
            <ul>
              <li><strong>Libre:</strong> otorgado sin presión ni coerción</li>
              <li><strong>Previo:</strong> antes del tratamiento de los datos</li>
              <li><strong>Expreso:</strong> mediante declaración affirmative</li>
              <li><strong>Informado:</strong> con conocimiento de la finalidad</li>
            </ul>
            <p>
              El consentimiento puede ser revocado en cualquier momento solicitando
              la eliminación o anonimización de los datos.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaDownload className={styles.sectionIcon} />
            4. Sus derechos como titular
          </h2>
          <div className={styles.sectionContent}>
            <p>Conforme a la Ley N° 29733, usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> solicitar una copia de todos sus datos personales almacenados</li>
              <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos</li>
              <li><strong>Eliminación:</strong> solicitar la anonimización o eliminación de sus datos</li>
              <li><strong>Revocación:</strong> revocar su consentimiento en cualquier momento</li>
            </ul>
            <p>
              Para ejercer estos derechos, comuníquese con la administración de la iglesia
              o utilize las herramientas disponibles en el sistema.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaTrash className={styles.sectionIcon} />
            5. Eliminación y anonimización
          </h2>
          <div className={styles.sectionContent}>
            <p>
              Cuando se solicita la eliminación de datos, el sistema procede a la
              <strong>anonimización</strong> de la información personal, reemplazando
              los datos identificables con valores eliminados, preservando la integridad
              de los registros eclesiásticos sin comprometer la privacidad del titular.
            </p>
            <p>
              La eliminación permanente (hard delete) solo está disponible para
              datos previamente anonimizados y requiere autorización de super administrador.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaEnvelope className={styles.sectionIcon} />
            6. Contacto
          </h2>
          <div className={styles.sectionContent}>
            <p>
              Para cualquier consulta sobre el tratamiento de sus datos personales,
              puede contactar a la administración de la iglesia a través de los
              canales oficiales de comunicación.
            </p>
          </div>
        </section>

        <div className={styles.footer}>
          <p>Última actualización: Agosto 2026 | Versión 1.0</p>
          <p>Política conforme a la Ley N° 29733 - Ley de Protección de Datos Personales del Perú</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
