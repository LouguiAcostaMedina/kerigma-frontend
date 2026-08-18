/**
 * Utilidad de generación de documentos oficiales de membresía (client-side)
 * Certificado de bautismo + Carta de recomendación
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CHURCH_NAME = 'Iglesia Adventista del Séptimo Día';
const CHURCH_ADDRESS = 'Dirección de la Iglesia';
const CHURCH_PHONE = 'Teléfono de la Iglesia';

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateEs(dateStr) {
  if (!dateStr) return 'N/D';
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function addChurchHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(CHURCH_NAME, pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CHURCH_ADDRESS, pageWidth / 2, 32, { align: 'center' });
  doc.text(CHURCH_PHONE, pageWidth / 2, 38, { align: 'center' });

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 42, pageWidth - 20, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 55, { align: 'center' });

  doc.setLineWidth(0.3);
  doc.line(60, 58, pageWidth - 60, 58);
}

function addFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Documento generado el ${formatDateEs(dateStamp())}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Sistema de Gestión Misionera', pageWidth / 2, pageHeight - 10, { align: 'center' });
}

/**
 * Genera un Certificado de Bautismo en PDF
 */
export function generateBaptismCertificate(member) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  addChurchHeader(doc, 'CERTIFICADO DE BAUTISMO');

  const y0 = 70;
  const lines = [
    ['Nombre completo:', `${member.firstName} ${member.lastName}`],
    ['Fecha de nacimiento:', formatDateEs(member.dateOfBirth)],
    ['Género:', member.gender === 'male' ? 'Masculino' : member.gender === 'female' ? 'Femenino' : 'Otro'],
    ['Fecha de bautismo:', formatDateEs(member.baptismDate)],
    ['Fecha de conversión:', formatDateEs(member.conversionDate)],
    ['Grupo asignado:', member.groupName || 'N/D'],
    ['Estado espiritual:', member.spiritualStatus || 'N/D'],
  ];

  let y = y0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  for (const [label, value] of lines) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    y += 8;
  }

  y += 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('Por medio del presente se certifica que el/la suscrito/a ha recibido el sacramento', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text('del bautismo por inmersión, de acuerdo con las enseñanzas bíblicas.', pageWidth / 2, y, { align: 'center' });

  y += 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.line(30, y, 90, y);
  doc.text('Firma del Pastor', 60, y + 5, { align: 'center' });

  doc.line(pageWidth - 90, y, pageWidth - 30, y);
  doc.text('Sello de la Iglesia', pageWidth - 60, y + 5, { align: 'center' });

  addFooter(doc);
  doc.save(`certificado_bautismo_${member.lastName}_${dateStamp()}.pdf`);
}

/**
 * Genera una Carta de Recomendación en PDF
 */
export function generateRecommendationLetter(member) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  addChurchHeader(doc, 'CARTA DE RECOMENDACIÓN');

  const y0 = 70;
  const today = formatDateEs(dateStamp());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Fecha: ${today}`, pageWidth - 25, y0, { align: 'right' });

  let y = y0 + 15;
  doc.text('A quien corresponda:', 25, y);
  y += 10;

  const memberName = `${member.firstName} ${member.lastName}`;
  const paragraphs = [
    `Por medio de la presente, se certifica que ${memberName} es miembro activo(a) de nuestra congregación.`,
    `Fecha de ingreso: ${formatDateEs(member.joinDate)}.`,
    member.baptized
      ? `Bautizado(a) el ${formatDateEs(member.baptismDate)}.`
      : 'Aún no ha sido bautizado(a).',
    `Grupo asignado: ${member.groupName || 'N/D'}.`,
    `Estado espiritual: ${member.spiritualStatus || 'N/D'}.`,
    member.status === 'active'
      ? 'Se recomienda al(la) suscrito(a) como miembro de buena reputación y conducta cristiana.'
      : `Estado actual: ${member.status}.`,
  ];

  doc.setFontSize(11);
  for (const text of paragraphs) {
    const splitText = doc.splitTextToSize(text, pageWidth - 50);
    doc.text(splitText, 25, y);
    y += splitText.length * 6 + 4;
  }

  y += 15;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('Se extiende la presente carta a solicitud del interesado(a) para los fines', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text('que considere convenientes.', pageWidth / 2, y, { align: 'center' });

  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.line(30, y, 90, y);
  doc.text('Firma del Pastor', 60, y + 5, { align: 'center' });

  doc.line(pageWidth - 90, y, pageWidth - 30, y);
  doc.text('Sello de la Iglesia', pageWidth - 60, y + 5, { align: 'center' });

  addFooter(doc);
  doc.save(`carta_recomendacion_${member.lastName}_${dateStamp()}.pdf`);
}

/**
 * Exporta la lista de miembros a CSV
 */
export function exportMembersToCsv(members) {
  const headers = [
    'Nombre', 'Apellido', 'Email', 'Teléfono', 'Fecha Nacimiento',
    'Género', 'Estado Civil', 'Ciudad', 'Grupo', 'Bautizado',
    'Fecha Bautismo', 'Estado', 'Fecha Ingreso', 'Ocupación',
  ];

  const rows = members.map((m) => [
    m.firstName,
    m.lastName,
    m.email || '',
    m.phone || '',
    m.dateOfBirth || '',
    m.gender || '',
    m.maritalStatus || '',
    m.city || '',
    m.groupName || '',
    m.baptized ? 'Sí' : 'No',
    m.baptismDate || '',
    m.status,
    m.joinDate,
    m.occupation || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lista_miembros_${dateStamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
