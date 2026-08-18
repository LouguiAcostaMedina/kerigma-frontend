import { useTranslation } from 'react-i18next';

const DemoBanner = () => {
  const { t } = useTranslation();

  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#f59e0b',
      color: '#000',
      textAlign: 'center',
      padding: '6px 16px',
      fontWeight: 600,
      fontSize: '0.85rem',
      letterSpacing: '0.02em',
    }}>
      {t('demo.banner')}
    </div>
  );
};

export default DemoBanner;
