import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateFinancialReport = async (reportData, chartsRef) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Relatório Financeiro Mensal', 14, yPos);
    yPos += 10;
    
    pdf.setFontSize(12);
    pdf.text(`Período: ${reportData.month}`, 14, yPos);
    yPos += 15;

    // Summary Metrics
    pdf.setFontSize(14);
    pdf.text('Resumo', 14, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Receita Total: R$ ${reportData.totalRevenue.toFixed(2)}`, 14, yPos);
    yPos += 7;
    pdf.text(`Despesas Totais: R$ ${reportData.totalExpenses.toFixed(2)}`, 14, yPos);
    yPos += 7;
    pdf.text(`Lucro Líquido: R$ ${reportData.netProfit.toFixed(2)}`, 14, yPos);
    yPos += 15;

    // Charts (if ref provided)
    if (chartsRef && chartsRef.current) {
      const canvas = await html2canvas(chartsRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * (pageWidth - 28)) / imgProps.width;
      
      if (yPos + pdfHeight > 280) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 14, yPos, pageWidth - 28, pdfHeight);
      yPos += pdfHeight + 15;
    }

    // Footer
    pdf.setFontSize(8);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 285);

    pdf.save(`relatorio-financeiro-${reportData.month.replace('/', '-')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};