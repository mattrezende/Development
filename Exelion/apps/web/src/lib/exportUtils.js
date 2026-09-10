import Papa from 'papaparse';
import { toast } from 'sonner';

export const exportToCSV = (data, filename = 'export.csv') => {
  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success('Arquivo CSV exportado com sucesso.');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Erro ao exportar CSV.');
  }
};

export const exportToPDF = (elementId, filename = 'export.pdf') => {
  // Stub implementation for now, visual feedback provided
  toast('Exportação para PDF estará disponível em breve.', {
    description: 'Estamos aprimorando nosso gerador de relatórios.',
  });
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  // Stub implementation for now, visual feedback provided
  toast('Exportação para Excel estará disponível em breve.', {
    description: 'Use a exportação CSV como alternativa momentânea.',
  });
};