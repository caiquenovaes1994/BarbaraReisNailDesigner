import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cake, ArrowLeft, Download, MessageCircle, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../utils/api';
import logo from '../../assets/BRND.svg';
import { applySpaceMonoFont, getSpaceMonoTableStyles } from '../../utils/pdfFontManager';

const MONTHS = [
  { value: 1, name: 'Janeiro' },
  { value: 2, name: 'Fevereiro' },
  { value: 3, name: 'Março' },
  { value: 4, name: 'Abril' },
  { value: 5, name: 'Maio' },
  { value: 6, name: 'Junho' },
  { value: 7, name: 'Julho' },
  { value: 8, name: 'Agosto' },
  { value: 9, name: 'Setembro' },
  { value: 10, name: 'Outubro' },
  { value: 11, name: 'Novembro' },
  { value: 12, name: 'Dezembro' },
];

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

const BirthdaysReport = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchBirthdays();
  }, [selectedMonth, selectedYear]);

  const fetchBirthdays = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/birthdays?month=${selectedMonth}&year=${selectedYear}`);
      setData(res.data);
    } catch (err) {
      console.error('Erro ao buscar aniversariantes:', err);
      toast.error('Erro ao carregar aniversariantes.');
    } finally {
      setLoading(false);
    }
  };

  const monthName = MONTHS.find(m => m.value === Number(selectedMonth))?.name || '';

  const totalBirthdays = data.length;
  const scheduledCount = data.filter(d => d.hasAppointment).length;
  const pendingCount = totalBirthdays - scheduledCount;

  const handleWhatsAppMessage = (customer) => {
    if (!customer.telefone) {
      toast.error('Cliente não possui telefone cadastrado.');
      return;
    }
    const cleanPhone = customer.telefone.replace(/\D/g, '');
    const ddi = customer.ddi || '55';
    
    // Emojis com escape Unicode explícito para garantir integridade UTF-8 em todos os navegadores
    const party = '\u{1F389}'; // 🎉
    const sparkles = '\u{2728}'; // ✨
    const cake = '\u{1F382}'; // 🎂
    
    // Extrai com segurança apenas o primeiro nome da cliente
    const firstName = (customer.nome || '').trim().split(/\s+/)[0] || 'Cliente';

    const message = `Olá, ${firstName}! ${party}\nDesejamos a você um Feliz Aniversário repleto de realizações, saúde e beleza!\nBárbara Reis Nail Designer agradece seu carinho e presença! ${sparkles}${cake}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${ddi}${cleanPhone}&text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF('portrait', 'mm', 'a4');
      await applySpaceMonoFont(doc);

      // Logo
      try {
        const logoBase64 = await loadImageAsPngBase64(logo);
        doc.addImage(logoBase64, 'PNG', 14, 6, 28, 17.5);
      } catch (e) {
        console.error('Erro ao carregar logo no PDF', e);
      }

      // Cabeçalho Centralizado
      doc.setFont('SpaceMono', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(40);
      doc.text('Relatório de Aniversariantes do Mês', 105, 18, { align: 'center' });

      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Mês de Referência: ${monthName} de ${selectedYear}`, 105, 24, { align: 'center' });

      // Data e Hora de emissão à direita (2 linhas)
      const now = new Date();
      const emissaoDate = now.toLocaleDateString('pt-BR');
      const emissaoTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      doc.setFont('SpaceMono', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(140);
      doc.text(emissaoDate, 196, 18, { align: 'right' });
      doc.text(emissaoTime, 196, 23, { align: 'right' });

      // Resumo Informativo
      doc.setFontSize(8.5);
      doc.setTextColor(80);
      doc.text(
        `Total de Aniversariantes: ${totalBirthdays}  |  Com Agendamento: ${scheduledCount}  |  Sem Agendamento: ${pendingCount}`,
        14,
        34
      );

      // Tabela de Dados
      const tableRows = data.map(item => {
        let apptInfo = 'Sem agendamento este mês';
        if (item.hasAppointment && item.appointments.length > 0) {
          const appt = item.appointments[0];
          const apptDate = new Date(appt.data);
          const dateStr = apptDate.toLocaleDateString('pt-BR');
          const timeStr = apptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          apptInfo = `Agendado (${dateStr} às ${timeStr}) - ${appt.procedimento || 'Procedimento'}`;
        }

        const telFormatted = item.telefone ? `(${item.telefone.slice(0, 2)}) ${item.telefone.slice(2)}` : '-';

        return [
          item.data_formatada,
          item.nome,
          telFormatted,
          apptInfo
        ];
      });

      const baseTableStyles = getSpaceMonoTableStyles();

      autoTable(doc, {
        head: [['Dia', 'Nome da Cliente', 'Telefone', 'Status de Atendimento no Mês']],
        body: tableRows,
        startY: 38,
        ...baseTableStyles,
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 55 },
          2: { cellWidth: 35 },
          3: { cellWidth: 72 }
        },
        didDrawPage: (pageData) => {
          // Rodapé
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFont('SpaceMono', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(150);
          doc.text(
            `Bárbara Reis Nail Designer • Página ${pageData.pageNumber} de ${pageCount}`,
            105,
            290,
            { align: 'center' }
          );
        }
      });

      doc.save(`Relatorio_Aniversariantes_${monthName}_${selectedYear}.pdf`);
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao exportar PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Voltar para Relatórios
          </Link>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
            <Cake size={32} className="text-primary" />
            Aniversariantes do Mês
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Mês */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value} className="bg-[#1e1e24] text-white">
                {m.name}
              </option>
            ))}
          </select>

          {/* Seletor de Ano */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y} className="bg-[#1e1e24] text-white">
                {y}
              </option>
            ))}
          </select>

          {/* Botão Exportar PDF */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting || loading || data.length === 0}
            className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-md"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Aniversariantes */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
            <Cake size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Aniversariantes em {monthName}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalBirthdays}</p>
          </div>
        </div>

        {/* Com Agendamento */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Com Agendamento no Mês</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{scheduledCount}</p>
          </div>
        </div>

        {/* Sem Agendamento */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Sem Agendamento Marcado</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Lista de Aniversariantes ({monthName})
          </h3>
          <span className="text-xs text-gray-400">
            Ordenado por dia do mês
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm">Carregando aniversariantes...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400 text-center">
            <Cake size={40} className="text-gray-600 mb-1" />
            <p className="text-base font-medium text-gray-300">Nenhum aniversariante encontrado em {monthName}.</p>
            <p className="text-xs text-gray-500 max-w-sm">
              Certifique-se de preencher o campo data de nascimento no cadastro das suas clientes para visualizá-las aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-20">Dia</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Contato</th>
                  <th className="py-3.5 px-4">Status no Mês</th>
                  <th className="py-3.5 px-4 text-center w-36">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {data.map((customer) => {
                  const hasAppt = customer.hasAppointment && customer.appointments.length > 0;
                  const firstAppt = hasAppt ? customer.appointments[0] : null;

                  return (
                    <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Dia */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs">
                          {customer.data_formatada}
                        </span>
                      </td>

                      {/* Nome */}
                      <td className="py-4 px-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/10">
                            {customer.nome.charAt(0).toUpperCase()}
                          </div>
                          <span>{customer.nome}</span>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="py-4 px-4 text-gray-300">
                        {customer.telefone ? (
                          <span className="font-mono text-xs text-gray-300">
                            ({customer.telefone.slice(0, 2)}) {customer.telefone.slice(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>

                      {/* Status no Mês */}
                      <td className="py-4 px-4">
                        {hasAppt ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>
                              {firstAppt.procedimento || 'Agendado'} (
                              {new Date(firstAppt.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Sem agendamento este mês</span>
                          </div>
                        )}
                      </td>

                      {/* Ação WhatsApp */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleWhatsAppMessage(customer)}
                          title="Enviar Felicitações no WhatsApp"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          <span>Parabenizar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdaysReport;
