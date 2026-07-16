import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import logo from '../../assets/BRND.svg';

const loadImageAsPngBase64 = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

const StatisticsReport = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [form, setForm] = useState({
    startDate: firstDay,
    endDate: lastDay,
    type: 'Todos'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const generateReport = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error('Selecione as datas para gerar o relatório.');
      return;
    }

    setIsLoading(true);
    try {
      const url = `/appointments?startDate=${form.startDate}T00:00:00.000Z&endDate=${form.endDate}T23:59:59.999Z`;
      const res = await api.get(url);
      const data = res.data.filter(appt => appt.status === 'Atendido');

      if (data.length === 0) {
        toast.error('Nenhum agendamento concluído encontrado para o período selecionado.');
        setIsLoading(false);
        return;
      }

      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      try {
        const logoBase64 = await loadImageAsPngBase64(logo);
        doc.addImage(logoBase64, 'PNG', 14, 6, 32, 20);
      } catch (err) {
        console.error('Erro ao carregar logo no PDF', err);
      }

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text('Relatório Estatístico', 105, 22, { align: 'center' });

      const now = new Date();
      const emissaoDate = now.toLocaleDateString('pt-BR');
      const emissaoTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`${emissaoDate} - ${emissaoTime}`, 196, 22, { align: 'right' });
      
      const formatBr = (dateString) => {
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
      };
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${formatBr(form.startDate)} a ${formatBr(form.endDate)}`, 105, 26, { align: 'center' });

      let currentY = 40;

      // Calculate Procedure Stats
      if (form.type === 'Todos' || form.type === 'Procedimentos') {
        const procStats = {};
        data.forEach(appt => {
          const pName = appt.procedure.nome;
          if (!procStats[pName]) {
            procStats[pName] = { count: 0, revenue: 0 };
          }
          procStats[pName].count += 1;
          procStats[pName].revenue += appt.valor_cobrado;
        });

        const procArray = Object.keys(procStats).map(name => ({
          name,
          count: procStats[name].count,
          revenue: procStats[name].revenue
        })).sort((a, b) => b.count - a.count);

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('Procedimentos Mais Realizados', 14, currentY);
        currentY += 5;

        autoTable(doc, {
          startY: currentY,
          head: [['Procedimento', 'Quantidade', 'Faturamento (R$)']],
          body: procArray.map(p => [
            p.name,
            p.count,
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.revenue)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [217, 70, 239] },
          margin: { top: 10, bottom: 20 }
        });
        currentY = doc.lastAutoTable.finalY + 15;
      }

      // Calculate Customer Stats
      if (form.type === 'Todos' || form.type === 'Clientes') {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        const custStats = {};
        data.forEach(appt => {
          const cName = appt.customer.nome;
          if (!custStats[cName]) {
            custStats[cName] = { count: 0, revenue: 0 };
          }
          custStats[cName].count += 1;
          custStats[cName].revenue += appt.valor_cobrado;
        });

        const custArray = Object.keys(custStats).map(name => ({
          name,
          count: custStats[name].count,
          revenue: custStats[name].revenue
        })).sort((a, b) => b.count - a.count);

        // Keep top 20 or all if we want. Let's do top 20 clients.
        const topCustomers = custArray.slice(0, 20);

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('Top Clientes (Mais Atendimentos)', 14, currentY);
        currentY += 5;

        autoTable(doc, {
          startY: currentY,
          head: [['Cliente', 'Atendimentos', 'Valor Gasto (R$)']],
          body: topCustomers.map(c => [
            c.name,
            c.count,
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.revenue)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [217, 70, 239] },
          margin: { top: 10, bottom: 20 }
        });
        currentY = doc.lastAutoTable.finalY + 15;
      }

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${i}/${pageCount}`, 105, 285, { align: 'center' });
      }

      doc.save('Relatorio_Estatistico.pdf');
      toast.success('Relatório gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar relatório estatístico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/reports" className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
            <TrendingUp size={32} className="text-primary" />
            Relatório Estatístico
          </h2>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden max-w-4xl mx-auto">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <h3 className="text-xl font-semibold border-b border-surface-border pb-4 mb-6">Filtros para Estatísticas</h3>

        <form onSubmit={generateReport} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">
                Data Inicial <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="startDate"
                required
                value={form.startDate}
                onChange={handleChange}
                className="glass-input" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">
                Data Final <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="endDate"
                required
                value={form.endDate}
                onChange={handleChange}
                className="glass-input" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Tipo de Estatística</label>
              <select name="type" value={form.type} onChange={handleChange} className="glass-input bg-background/90">
                <option value="Todos">Todas (Procedimentos e Clientes)</option>
                <option value="Procedimentos">Procedimentos Mais Realizados</option>
                <option value="Clientes">Clientes Mais Atendidos</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 px-8"
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> Gerando...</> : <><Download size={20} /> Baixar Relatório PDF</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatisticsReport;
