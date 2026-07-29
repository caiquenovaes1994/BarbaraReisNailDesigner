import { useState } from 'react';
import { History, ArrowLeft, Star, Wrench, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

const Changelog = () => {
  const versions = [
    {
      version: 'v1.1.0',
      date: '29 de Julho de 2026',
      title: 'Segurança & Endereço de Clientes',
      description: 'Novo campo de endereço com navegação GPS integrada, indicadores de campos obrigatórios e pacote completo de correções de cibersegurança.',
      changes: [
        { type: 'feature', text: 'Campo de endereço no cadastro de clientes' },
        { type: 'feature', text: 'Botão "Ir" com navegação via Google Maps, Uber e Waze' },
        { type: 'feature', text: 'Indicadores visuais de campos obrigatórios (asterisco vermelho com tooltip)' },
        { type: 'feature', text: 'Criptografia AES-256-CBC de telefone, data de nascimento e endereço no banco de dados' },
        { type: 'fix', text: 'CORS restrito por whitelist (antes aceitava qualquer domínio)' },
        { type: 'fix', text: 'Removida chave de criptografia hardcoded do código-fonte' },
        { type: 'fix', text: 'Content Security Policy (CSP) personalizada no backend e frontend' },
        { type: 'fix', text: 'Cookie SameSite reforçado de "none" para "lax" em produção' },
        { type: 'fix', text: 'Sourcemaps desabilitados explicitamente no build de produção' },
        { type: 'fix', text: 'Certificado SSL removido do versionamento Git' },
      ]
    },
    {
      version: 'v1.0.0',
      date: '20 de Julho de 2026',
      title: 'Lançamento Oficial',
      description: 'Primeira versão estável do sistema Bárbara Reis Nail Designer.',
      changes: [
        { type: 'feature', text: 'Dashboard interativo com visão geral de agendamentos' },
        { type: 'feature', text: 'Agenda em grade semanal com bloqueio de datas passadas' },
        { type: 'feature', text: 'Cadastro completo de Clientes e Procedimentos' },
        { type: 'feature', text: 'Painel Financeiro com estimativa de faturamento' },
        { type: 'feature', text: 'Geração de Relatórios em PDF (Estatístico e Atendimentos)' },
        { type: 'feature', text: 'Autenticação segura via JWT com Cookie HTTP-Only' },
        { type: 'fix', text: 'Migração de banco SQLite para PostgreSQL (Supabase)' },
        { type: 'fix', text: 'Ajustes de CORS e resolução de Mixed Content' }
      ]
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'feature': return <Star size={16} className="text-yellow-400" />;
      case 'fix': return <Wrench size={16} className="text-blue-400" />;
      case 'bug': return <Bug size={16} className="text-red-400" />;
      default: return <Star size={16} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <History className="text-primary" />
            Histórico de Versões
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Acompanhe as novidades e atualizações do sistema
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {versions.map((v, idx) => (
          <div key={v.version} className="glass-panel p-4 rounded-2xl border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/30">
                  {v.version}
                </span>
                <h2 className="text-xl font-semibold text-white">{v.title}</h2>
              </div>
              <span className="text-sm font-medium text-gray-400 bg-[#1e1e24] px-3 py-1 rounded-full">
                {v.date}
              </span>
            </div>
            
            <p className="text-gray-300 mb-3 text-sm">{v.description}</p>
            
            <div className="space-y-1.5">
              {v.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                  <div className="mt-0.5">{getIcon(change.type)}</div>
                  <span className="text-gray-200">{change.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Changelog;
