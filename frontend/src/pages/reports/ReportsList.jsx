import { Link } from 'react-router-dom';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

const ReportsList = () => {
  const reports = [
    {
      id: 'atendimentos',
      name: 'Atendimentos',
      description: 'Relatório detalhado de agendamentos por cliente, procedimento, datas e status.',
      icon: Calendar,
      path: '/reports/atendimentos'
    },
    {
      id: 'estatistico',
      name: 'Estatístico',
      description: 'Análise de métricas, procedimentos mais realizados e clientes mais assíduos.',
      icon: TrendingUp,
      path: '/reports/estatistico'
    }
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
          <FileText size={32} className="text-primary" />
          Relatórios
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Link
            key={report.id}
            to={report.path}
            className="glass-panel p-6 flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface rounded-xl group-hover:bg-primary/10 transition-colors">
                <report.icon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {report.name}
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {report.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
