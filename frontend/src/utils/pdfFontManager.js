let regularBase64Cache = null;
let boldBase64Cache = null;

/**
 * Carrega um arquivo de fonte TTF via fetch e converte para Base64
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function loadFontAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar fonte de ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Registra e ativa a família tipográfica TrueType Space Mono (Regular e Bold) na instância do jsPDF
 * @param {import('jspdf').jsPDF} doc
 * @returns {Promise<boolean>}
 */
export async function applySpaceMonoFont(doc) {
  try {
    if (!regularBase64Cache) {
      regularBase64Cache = await loadFontAsBase64('/fonts/SpaceMono-Regular.ttf');
    }
    if (!boldBase64Cache) {
      boldBase64Cache = await loadFontAsBase64('/fonts/SpaceMono-Bold.ttf');
    }

    doc.addFileToVFS('SpaceMono-Regular.ttf', regularBase64Cache);
    doc.addFont('SpaceMono-Regular.ttf', 'SpaceMono', 'normal');

    doc.addFileToVFS('SpaceMono-Bold.ttf', boldBase64Cache);
    doc.addFont('SpaceMono-Bold.ttf', 'SpaceMono', 'bold');

    doc.setFont('SpaceMono', 'normal');
    return true;
  } catch (error) {
    console.error('Erro ao registrar fonte Space Mono no PDF:', error);
    return false;
  }
}

/**
 * Retorna as configurações de estilo padronizadas para jspdf-autotable utilizando Space Mono
 */
export function getSpaceMonoTableStyles() {
  return {
    theme: 'striped',
    headStyles: {
      fillColor: [217, 70, 239], // Primary (#d946ef)
      textColor: [255, 255, 255],
      font: 'SpaceMono',
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      font: 'SpaceMono',
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: 3,
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [248, 248, 250]
    }
  };
}
