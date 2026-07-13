import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, CalendarCheck, Filter } from 'lucide-react';
import api from '../utils/api';

const Finance = () => {
  const [summary, setSummary] = useState({ receita_efetiva: 0, receita_prevista: 0 });
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/finance/summary?startDate=${startDate}&endDate=${endDate}`);
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const totalPotencial = summary.receita_efetiva + summary.receita_prevista;

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const chartData = [
    { name: 'Receita Efetiva', valor: summary.receita_efetiva, fill: '#D946EF' },
    { name: 'Receita Agendada', valor: summary.receita_prevista, fill: '#8B5CF6' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Financeiro
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-surface-border p-2 sm:p-3 rounded-xl border border-white/5 w-full md:w-auto">
          <div className="flex items-center gap-2 text-gray-400 w-full sm:w-auto justify-center sm:justify-start">
            <Filter size={18} />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <input 
              type="date" 
              className="bg-transparent border-none text-sm text-gray-300 focus:outline-none focus:ring-0 cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-500">até</span>
            <input 
              type="date" 
              className="bg-transparent border-none text-sm text-gray-300 focus:outline-none focus:ring-0 cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-primary"><DollarSign size={100} /></div>
          <p className="text-gray-400 font-medium">Faturamento Efetivo</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(summary.receita_efetiva)}</h3>
          <p className="text-xs text-green-400">Pagamentos confirmados no período</p>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-secondary"><CalendarCheck size={100} /></div>
          <p className="text-gray-400 font-medium">Faturamento Agendado</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(summary.receita_prevista)}</h3>
          <p className="text-xs text-yellow-400">Agendamentos futuros no período</p>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-surface to-primary/10 border-primary/20">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white"><TrendingUp size={100} /></div>
          <p className="text-gray-300 font-medium">Faturamento Potencial</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(totalPotencial)}</h3>
          <p className="text-xs text-primary">Efetivo + Agendado</p>
        </div>
      </div>

      <div className="glass-panel p-8 h-[400px]">
        <h3 className="text-xl font-semibold mb-6">Projeção Financeira</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(val) => `R$ ${val}`} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}} 
              contentStyle={{ backgroundColor: '#18181B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
              formatter={(value) => [formatCurrency(value), 'Valor']} 
            />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Finance;
