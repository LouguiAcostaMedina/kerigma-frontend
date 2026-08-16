/**
 * Componente de estadísticas de usuarios
 * Muestra métricas principales con gráficos y indicadores visuales
 */

import React from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaChartLine, FaUserShield, FaUserTie, FaUserCog, FaCrown } from 'react-icons/fa';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import styles from './UserStats.module.css';

const UserStats = ({ stats = {} }) => {
  const {
    total = 0,
    active = 0,
    inactive = 0,
    suspended = 0,
    pending = 0,
    byRole = {},
    byChurch = {},
    recentActivity = []
  } = stats;

  // Calcular porcentajes
  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
  const inactivePercentage = total > 0 ? Math.round((inactive / total) * 100) : 0;
  const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Tarjetas de estadísticas principales
  const mainStats = [
    {
      title: 'Total de Usuarios',
      value: total,
      icon: <FaUsers />,
      color: 'primary',
      description: 'Usuarios registrados'
    },
    {
      title: 'Usuarios Activos',
      value: active,
      icon: <FaUserCheck />,
      color: 'success',
      percentage: activePercentage,
      description: `${activePercentage}% del total`
    },
    {
      title: 'Usuarios Inactivos',
      value: inactive,
      icon: <FaUserTimes />,
      color: 'warning',
      percentage: inactivePercentage,
      description: `${inactivePercentage}% del total`
    },
    {
      title: 'Usuarios Pendientes',
      value: pending,
      icon: <FaUserClock />,
      color: 'info',
      percentage: pendingPercentage,
      description: `${pendingPercentage}% del total`
    }
  ];

  // Estadísticas por rol
  const roleStats = [
    { role: ROLES.SUPER_ADMIN, label: `${ROLE_LABELS[ROLES.SUPER_ADMIN]}es`, icon: <FaCrown />, count: byRole[ROLES.SUPER_ADMIN] || 0 },
    { role: ROLES.ADMIN, label: `${ROLE_LABELS[ROLES.ADMIN]}es`, icon: <FaUserShield />, count: byRole[ROLES.ADMIN] || 0 },
    { role: ROLES.DIRECTOR, label: `${ROLE_LABELS[ROLES.DIRECTOR]}es`, icon: <FaUserTie />, count: byRole[ROLES.DIRECTOR] || 0 },
    { role: ROLES.LEADER, label: `${ROLE_LABELS[ROLES.LEADER]}es`, icon: <FaUserCog />, count: byRole[ROLES.LEADER] || 0 },
    { role: ROLES.READER, label: `${ROLE_LABELS[ROLES.READER]}es`, icon: <FaUsers />, count: byRole[ROLES.READER] || 0 }
  ];

  // Top iglesias por número de usuarios
  const topChurches = Object.entries(byChurch)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className={styles.userStats}>
      {/* Estadísticas principales */}
      <div className={styles.mainStats}>
        {mainStats.map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>{stat.title}</h3>
              <div className={styles.statValue}>
                {stat.value.toLocaleString()}
              </div>
              <p className={styles.statDescription}>{stat.description}</p>
              
              {stat.percentage !== undefined && (
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.detailedStats}>
        {/* Distribución por roles */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>
            <FaChartLine className={styles.sectionIcon} />
            Distribución por Roles
          </h3>
          <div className={styles.roleStats}>
            {roleStats.map((roleStat, index) => {
              const percentage = total > 0 ? Math.round((roleStat.count / total) * 100) : 0;
              return (
                <div key={index} className={styles.roleStatItem}>
                  <div className={styles.roleInfo}>
                    <div className={`${styles.roleIcon} ${styles[roleStat.role]}`}>
                      {roleStat.icon}
                    </div>
                    <div className={styles.roleDetails}>
                      <span className={styles.roleLabel}>{roleStat.label}</span>
                      <div className={styles.roleMetrics}>
                        <span className={styles.roleCount}>{roleStat.count}</span>
                        <span className={styles.rolePercentage}>({percentage}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.roleProgress}>
                    <div 
                      className={`${styles.roleProgressFill} ${styles[roleStat.role]}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top iglesias */}
        {topChurches.length > 0 && (
          <div className={styles.statsSection}>
            <h3 className={styles.sectionTitle}>
              <FaUsers className={styles.sectionIcon} />
              Iglesias con Más Usuarios
            </h3>
            <div className={styles.churchStats}>
              {topChurches.map(([churchName, count], index) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={index} className={styles.churchStatItem}>
                    <div className={styles.churchRank}>#{index + 1}</div>
                    <div className={styles.churchInfo}>
                      <span className={styles.churchName}>{churchName}</span>
                      <div className={styles.churchMetrics}>
                        <span className={styles.churchCount}>{count} usuarios</span>
                        <span className={styles.churchPercentage}>({percentage}%)</span>
                      </div>
                    </div>
                    <div className={styles.churchProgress}>
                      <div 
                        className={styles.churchProgressFill}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actividad reciente */}
        {recentActivity.length > 0 && (
          <div className={styles.statsSection}>
            <h3 className={styles.sectionTitle}>
              <FaChartLine className={styles.sectionIcon} />
              Actividad Reciente
            </h3>
            <div className={styles.activityList}>
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>{activity.description}</span>
                    <span className={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumen rápido */}
      <div className={styles.quickSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tasa de Actividad:</span>
          <span className={`${styles.summaryValue} ${activePercentage >= 80 ? styles.success : activePercentage >= 60 ? styles.warning : styles.error}`}>
            {activePercentage}%
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Usuarios Suspendidos:</span>
          <span className={`${styles.summaryValue} ${suspended > 0 ? styles.warning : styles.success}`}>
            {suspended}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Roles Únicos:</span>
          <span className={styles.summaryValue}>
            {Object.keys(byRole).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;