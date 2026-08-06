import { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import logo from '../../assets/BRND.svg';
import { applySpaceMonoFont, getSpaceMonoTableStyles } from '../../utils/pdfFontManager';

const loadImageAsPngBase64 = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // SVG viewBox is 400x250. Multiply by 2 for higher resolution in PDF
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

const AppointmentsReport = () => {
  const [customers, setCustomers] = useState([]);
  const [procedures, setProcedures] = useState([]);
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [form, setForm] = useState({
    startDate: firstDay,
    endDate: lastDay,
    customerId: '',
    procedureId: '',
    status: '',
    orderBy: 'Data',
    groupBy: 'Nenhum'
  });

  const [isLoading, setIsLoading] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const normalizeString = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
  };

  useEffect(() => {
    const handleClick = () => {
      setShowCustomerDropdown(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [cust, proc] = await Promise.all([
          api.get('/customers?includeInactive=false'),
          api.get('/procedures?includeInactive=false')
        ]);
        const sortedProcedures = proc.data.sort((a, b) => a.nome.localeCompare(b.nome));
        const sortedCustomers = cust.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setCustomers(sortedCustomers);
        setProcedures(sortedProcedures);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    fetchSelectData();
  }, []);

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
      // Build query string
      let url = `/appointments?startDate=${form.startDate}T00:00:00.000Z&endDate=${form.endDate}T23:59:59.999Z`;
      if (form.customerId) url += `&customerId=${form.customerId}`;
      if (form.procedureId) url += `&procedureId=${form.procedureId}`;

      const res = await api.get(url);
      let data = res.data;

      if (form.status) {
        data = data.filter(appt => appt.status && appt.status.toLowerCase() === form.status.toLowerCase());
      }

      if (data.length === 0) {
        toast.error('Nenhum agendamento encontrado para os filtros selecionados.');
        setIsLoading(false);
        return;
      }

      const doc = new jsPDF('landscape', 'mm', 'a4');
      await applySpaceMonoFont(doc);
      
      // Logo e Nome do Estúdio (Esquerda)
      try {
        const logoBase64 = await loadImageAsPngBase64(logo);
        // Original size ratio: 400x250. If width is 32, height is 20.
        doc.addImage(logoBase64, 'PNG', 14, 6, 32, 20);
      } catch (e) {
        console.error('Erro ao carregar logo no PDF', e);
      }

      // Título Centralizado
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text('Relatório de Atendimentos', 148.5, 20, { align: 'center' });

      // Data e Hora de emissão à direita (2 linhas)
      const now = new Date();
      const emissaoDate = now.toLocaleDateString('pt-BR');
      const emissaoTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(140);
      doc.text(emissaoDate, 283, 19, { align: 'right' });
      doc.text(emissaoTime, 283, 24, { align: 'right' });
      
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100);
      
      // Formatting date range for header
      const formatBr = (dateString) => {
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
      };
      
      doc.text(`${formatBr(form.startDate)} a ${formatBr(form.endDate)}`, 148.5, 26, { align: 'center' });
      
      let filterText = '';
      if (form.customerId) {
        const c = customers.find(x => x.id === parseInt(form.customerId));
        if (c) filterText += `Cliente: ${c.nome}   `;
      }
      if (form.procedureId) {
        const p = procedures.find(x => x.id === parseInt(form.procedureId));
        if (p) filterText += `Procedimento: ${p.nome}   `;
      }
      if (form.status) {
        filterText += `Status: ${form.status}`;
      }
      if (filterText) {
        doc.setFont('SpaceMono', 'normal');
        doc.setFontSize(8.5);
        doc.text(filterText, 14, 34);
      }

      const getVal = (appt, type) => {
        if (type === 'Data') return new Date(appt.data_atendimento).getTime();
        if (type === 'Nome' || type === 'Cliente') return appt.customer.nome.toLowerCase();
        if (type === 'Procedimento') return appt.procedure.nome.toLowerCase();
        if (type === 'Valor') return appt.valor_cobrado;
        if (type === 'Status') return appt.status.toLowerCase();
        return '';
      };

      data.sort((a, b) => {
        if (form.groupBy !== 'Nenhum') {
          let gA = getVal(a, form.groupBy);
          let gB = getVal(b, form.groupBy);
          if (form.groupBy === 'Data') {
            gA = new Date(a.data_atendimento).toLocaleDateString('pt-BR').split('/').reverse().join('-');
            gB = new Date(b.data_atendimento).toLocaleDateString('pt-BR').split('/').reverse().join('-');
          }
          if (gA < gB) return -1;
          if (gA > gB) return 1;
        }

        let oA = getVal(a, form.orderBy);
        let oB = getVal(b, form.orderBy);
        if (oA < oB) return -1;
        if (oA > oB) return 1;
        return 0;
      });

      const tableColumn = ["Nome", "Procedimento", "Data", "Status", "Valor Cobrado"];
      const tableRows = [];
      let totalValor = 0;
      let totalPendente = 0;
      let currentGroup = null;

      data.forEach(appt => {
        const dateObj = new Date(appt.data_atendimento);
        const dataFormatada = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appt.valor_cobrado);
        
        if (appt.status === 'Atendido') {
            totalValor += appt.valor_cobrado;
        } else if (appt.status === 'Agendado') {
            totalPendente += appt.valor_cobrado;
        }

        if (form.groupBy !== 'Nenhum') {
           let groupVal = '';
           if (form.groupBy === 'Cliente') groupVal = appt.customer.nome;
           if (form.groupBy === 'Procedimento') groupVal = appt.procedure.nome;
           if (form.groupBy === 'Status') groupVal = appt.status;
           if (form.groupBy === 'Data') groupVal = dateObj.toLocaleDateString('pt-BR');
           
           if (groupVal !== currentGroup) {
              currentGroup = groupVal;
              tableRows.push([
                { 
                  content: `${form.groupBy}: ${groupVal}`, 
                  colSpan: 5, 
                  styles: { font: 'SpaceMono', fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [0, 0, 0] } 
                }
              ]);
           }
        }

        const apptData = [
          appt.customer.nome,
          appt.procedure.nome,
          dataFormatada,
          appt.status,
          valorFormatado
        ];
        tableRows.push(apptData);
      });

      const baseTableStyles = getSpaceMonoTableStyles();

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: filterText ? 38 : 34,
        ...baseTableStyles,
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 75 },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' },
          4: { cellWidth: 39, halign: 'right' }
        },
        margin: { top: 10, bottom: 45, left: 14, right: 14 }
      });

      // Painel de Estatísticas Fixo no Fim da Página (Landscape A4: altura 210mm, largura 297mm)
      const boxY = 168;
      const boxWidth = 269;
      const boxHeight = 25;

      // Fundo e borda do card de estatísticas
      doc.setFillColor(250, 248, 252);
      doc.setDrawColor(217, 70, 239);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'FD');

      // Título do card de resumo
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(157, 23, 77); // Deep Pink
      doc.text('RESUMO FINANCEIRO & OPERACIONAL', 18, boxY + 6);

      // Linha separadora interna
      doc.setDrawColor(230, 220, 240);
      doc.setLineWidth(0.2);
      doc.line(18, boxY + 8.5, 14 + boxWidth - 4, boxY + 8.5);

      // Coluna 1: Total Faturado
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL FATURADO', 18, boxY + 14);
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(22, 101, 52); // Green
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor), 18, boxY + 20);

      // Coluna 2: Total Pendente
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL PENDENTE', 85, boxY + 14);
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente), 85, boxY + 20);

      // Coluna 3: Faturamento Potencial
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('FATURAMENTO POTENCIAL', 152, boxY + 14);
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(147, 51, 234); // Purple
      doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor + totalPendente), 152, boxY + 20);

      // Coluna 4: Total de Registros
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL DE REGISTROS', 225, boxY + 14);
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // Slate
      doc.text(`${data.length} atendimentos`, 225, boxY + 20);

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('SpaceMono', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(150);
        // A4 Landscape width is 297mm, center is 148.5mm, height 210mm
        doc.text(`Bárbara Reis Nail Designer • Página ${i} de ${pageCount}`, 148.5, 202, { align: 'center' });
      }

      doc.save('Relatorio_Atendimentos.pdf');
      toast.success('Relatório gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar relatório.');
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
            <FileText size={32} className="text-primary" />
            Relatório de Atendimentos
          </h2>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden max-w-4xl mx-auto">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <h3 className="text-xl font-semibold border-b border-surface-border pb-4 mb-6">Filtros para Atendimentos</h3>

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
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm text-gray-400">Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="glass-input w-full"
                  placeholder="Todos os Clientes..."
                  value={customerSearch}
                  onFocus={(e) => { e.stopPropagation(); setShowCustomerDropdown(true); }}
                  onClick={(e) => { e.stopPropagation(); setShowCustomerDropdown(true); }}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setForm({...form, customerId: ''});
                    setShowCustomerDropdown(true);
                  }}
                />
                {showCustomerDropdown && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e24] border border-surface-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="p-3 hover:bg-white/5 cursor-pointer text-sm text-gray-300 transition-colors border-b border-surface-border/50"
                      onClick={() => {
                        setForm({...form, customerId: ''});
                        setCustomerSearch('');
                        setShowCustomerDropdown(false);
                      }}
                    >
                      Todos os Clientes
                    </div>
                    {customers.filter(c => normalizeString(c.nome).includes(normalizeString(customerSearch))).length === 0 ? (
                      <div className="p-3 text-sm text-gray-400 text-center">Nenhum cliente encontrado</div>
                    ) : (
                      customers.filter(c => normalizeString(c.nome).includes(normalizeString(customerSearch))).map(c => (
                        <div 
                          key={c.id} 
                          className="p-3 hover:bg-white/5 cursor-pointer text-sm text-white transition-colors"
                          onClick={() => {
                            setForm({...form, customerId: c.id});
                            setCustomerSearch(c.nome);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          {c.nome}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Procedimento</label>
              <select 
                name="procedureId" 
                value={form.procedureId} 
                onChange={handleChange} 
                className="glass-input bg-background/90"
              >
                <option value="">Todos os Procedimentos</option>
                {procedures.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="glass-input bg-background/90">
                <option value="">Todos</option>
                <option value="Agendado">Agendado</option>
                <option value="Atendido">Atendido</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Agrupar por</label>
              <select name="groupBy" value={form.groupBy} onChange={handleChange} className="glass-input bg-background/90">
                <option value="Nenhum">Nenhum</option>
                <option value="Cliente">Cliente</option>
                <option value="Data">Data</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Status">Status</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Ordenar por</label>
              <select name="orderBy" value={form.orderBy} onChange={handleChange} className="glass-input bg-background/90">
                <option value="Data">Data</option>
                <option value="Nome">Nome</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Valor">Valor</option>
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

export default AppointmentsReport;
