let regularBase64Cache = null;
let boldBase64Cache = null;

// Converte arquivo de fonte para Base64
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

// Registra fonte Space Mono no jsPDF
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

// Retorna estilos de tabela para jsPDF
export function getSpaceMonoTableStyles() {
  return {
    theme: 'striped',
    headStyles: {
      fillColor: [217, 70, 239], // Cor primária
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
