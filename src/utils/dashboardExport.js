/**
 * Utilidades de exportación del Dashboard
 * Genera reportes PDF (jspdf + autotable) y Excel (xlsx-js-style) de los datos
 * provenientes de /dashboard/kpis y /dashboard/spiritual-health
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';

const GOAL_TYPE_LABELS = {
  comunion: 'Comunión',
  relacionamiento: 'Relacionamiento',
  mision: 'Misión'
};

const dateStamp = () => new Date().toISOString().split('T')[0];

const buildKpiRows = (kpis) => {
  if (!kpis) return [];
  const growth = kpis.growth || {};
  return [
    ['Miembros Totales', kpis.totalMembers ?? 0],
    ['Miembros Activos', kpis.activeMembers ?? 0],
    ['Grupos Totales', kpis.totalGroups ?? 0],
    ['Grupos Activos', kpis.activeGroups ?? 0],
    ['Estudiantes Bíblicos', kpis.totalBibleStudents ?? 0],
    ['Estudiantes en Curso', kpis.bibleStudentsInProgress ?? 0],
    ['Estudiantes Bautizados', kpis.baptizedStudents ?? 0],
    ['Miembros Bautizados', kpis.baptizedMembers ?? 0],
    ['Bautismos Totales', kpis.totalBaptisms ?? 0],
    ['Parejas Discipuladoras Activas', kpis.totalActiveDisciplePairs ?? 0],
    ['Registros de Asistencia', kpis.attendanceRecords ?? 0],
    ['Crecimiento del Trimestre', `${growth.growthPercent ?? 0}%`],
    ['Miembros Fin de Trimestre Anterior', growth.previousQuarterMembers ?? 0],
    ['Miembros Fin de Trimestre Actual', growth.currentQuarterMembers ?? 0]
  ];
};

const buildPillarRows = (spiritual) => {
  const pillars = spiritual?.pillars;
  if (!pillars) return [];
  return ['comunion', 'relacionamiento', 'mision'].map((key) => {
    const pillar = pillars[key];
    if (!pillar) return null;
    return [pillar.label, `${pillar.value}%`, pillar.description];
  }).filter(Boolean);
};

const buildGoalRows = (spiritual) => {
  const goals = spiritual?.goals || [];
  return goals.map((goal) => [
    goal.title,
    GOAL_TYPE_LABELS[goal.goalType] || goal.goalType,
    goal.targetValue,
    goal.achievedValue ?? goal.currentValue ?? 0,
    `${goal.progressPercent}%`,
    goal.status
  ]);
};

export const exportDashboardPdf = ({ kpis, spiritual }) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text('Reporte del Dashboard - Sistema Misionero', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  const quarter = spiritual?.quarter;
  const quarterLabel = quarter ? `${quarter.name} ${quarter.year}` : 'Sin trimestre activo';
  doc.text(`Trimestre: ${quarterLabel}`, 14, 28);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [['Métrica', 'Valor']],
    body: buildKpiRows(kpis),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });

  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.text('Pilares Espirituales', 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [['Pilar', 'Valor', 'Descripción']],
    body: buildPillarRows(spiritual),
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    styles: { fontSize: 10 }
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text('Metas del Trimestre', 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [['Meta', 'Tipo', 'Planificado', 'Alcanzado', 'Progreso', 'Estado']],
    body: buildGoalRows(spiritual),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  });

  doc.save(`dashboard_${dateStamp()}.pdf`);
};

const applyHeaderStyle = (sheet, headerRow, numColumns) => {
  for (let col = 0; col < numColumns; col += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c: col })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
      fill: { fgColor: { rgb: '3B82F6' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
};

// Descarga un Blob en el navegador sin depender de Node (fs/stream.Readable)
const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportDashboardExcel = ({ kpis, spiritual }) => {
  const wb = XLSX.utils.book_new();

  const kpiSheet = XLSX.utils.aoa_to_sheet([['Métrica', 'Valor'], ...buildKpiRows(kpis)]);
  applyHeaderStyle(kpiSheet, 0, 2);
  kpiSheet['!cols'] = [{ wch: 36 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');

  const pillarSheet = XLSX.utils.aoa_to_sheet([['Pilar', 'Valor (%)', 'Descripción'], ...buildPillarRows(spiritual)]);
  applyHeaderStyle(pillarSheet, 0, 3);
  pillarSheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, pillarSheet, 'Pilares');

  const goalSheet = XLSX.utils.aoa_to_sheet([
    ['Meta', 'Tipo', 'Planificado', 'Alcanzado', 'Progreso (%)', 'Estado'],
    ...buildGoalRows(spiritual)
  ]);
  applyHeaderStyle(goalSheet, 0, 6);
  goalSheet['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, goalSheet, 'Metas');

  // Genera el libro como ArrayBuffer en memoria y descarga como Blob (compatible con el cliente)
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `dashboard_${dateStamp()}.xlsx`);
};
