import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const Procedures = () => {
  const [procedures, setProcedures] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [procedureForm, setProcedureForm] = useState({
    nome: '',
    precoStr: '',
    duracao_hhmm: '01:00',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredProcedures = procedures.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredProcedures.length / itemsPerPage);
  const paginatedProcedures = filteredProcedures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/procedures?includeInactive=${showInactive}`);
      // Sort alphabetically by name
      const sorted = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
      setProcedures(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showInactive]);

  const openNewForm = () => {
    setEditingId(null);
    setProcedureForm({ nome: '', precoStr: '', duracao_hhmm: '01:00' });
    setIsFormOpen(true);
  };

  const openEditForm = (procedure) => {
    setEditingId(procedure.id);
    
    // Format preco
    const formattedPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(procedure.preco);
    
    // Format duracao
    const d = procedure.duracao || 60;
    const h = Math.floor(d / 60).toString().padStart(2, '0');
    const m = (d % 60).toString().padStart(2, '0');
    
    setProcedureForm({ 
      nome: procedure.nome, 
      precoStr: formattedPreco, 
      duracao_hhmm: `${h}:${m}` 
    });
    setIsFormOpen(true);
  };

  const saveProcedure = async (e) => {
    e.preventDefault();
    
    // Parse preco
    const precoValue = parseFloat(procedureForm.precoStr.replace(/[^\d,-]/g, '').replace(',', '.'));
    
    // Parse duracao
    const [h, m] = procedureForm.duracao_hhmm.split(':');
    const duracaoValue = parseInt(h) * 60 + parseInt(m);

    const payload = {
      nome: procedureForm.nome,
      preco: precoValue,
      duracao: duracaoValue
    };

    try {
      if (editingId) {
        await api.put(`/procedures/${editingId}`, payload);
      } else {
        await api.post('/procedures', payload);
      }
      setProcedureForm({ nome: '', precoStr: '', duracao_hhmm: '01:00' });
      setEditingId(null);
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar procedimento:', err);
      alert(err.response?.data?.error || 'Erro ao salvar procedimento. Tente novamente.');
    }
  };

  const deleteProcedure = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este procedimento?')) {
      try {
        const res = await api.delete(`/procedures/${id}`);
        if (res.data.softDeleted) {
          alert(res.data.message); // Avisa que foi inativado
        }
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir procedimento.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Procedimentos
        </h2>
        
        <label className="flex items-center cursor-pointer gap-2 text-sm text-gray-300 hover:text-white transition-colors">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showInactive ? 'bg-primary' : 'bg-surface-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showInactive ? 'transform translate-x-4' : ''}`}></div>
          </div>
          Mostrar Inativos
        </label>
      </div>

      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar procedimento..." 
              className="glass-input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              Mostrar
              <select 
                className="bg-surface border border-surface-border rounded-lg px-2 py-1 text-white outline-none"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10} className="bg-[#1e1e24]">10</option>
                <option value={20} className="bg-[#1e1e24]">20</option>
                <option value={50} className="bg-[#1e1e24]">50</option>
                <option value={100} className="bg-[#1e1e24]">100</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Duração (Min)</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProcedures.map((p) => (
                <tr key={p.id} className={!p.ativo ? 'opacity-60' : ''}>
                  <td className="font-medium text-white">{p.nome}</td>
                  <td>R$ {p.preco.toFixed(2)}</td>
                  <td>
                    {Math.floor((p.duracao || 60) / 60).toString().padStart(2, '0')}:{(p.duracao || 60) % 60 < 10 ? '0' : ''}{(p.duracao || 60) % 60} h
                  </td>
                  <td>
                    {p.ativo ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Inativo</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditForm(p)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-surface-border"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      {p.ativo && (
                        <button 
                          onClick={() => deleteProcedure(p.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-surface-border"
                          title="Deletar/Inativar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProcedures.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-4">
                    Nenhum procedimento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 relative z-10">
          <span className="text-sm text-gray-400">
            Mostrando {filteredProcedures.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredProcedures.length)} de {filteredProcedures.length} registros
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg bg-surface-border text-gray-300 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg bg-surface-border text-gray-300 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for new/edit registration */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel p-6 sm:p-8 w-full max-w-md relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">
              {editingId ? 'Editar Procedimento' : 'Novo Procedimento'}
            </h3>
            
            <form onSubmit={saveProcedure} className="flex flex-col gap-4">
              <input
                placeholder="Nome do Procedimento"
                className="glass-input"
                required
                value={procedureForm.nome}
                onChange={(e) =>
                  setProcedureForm({ ...procedureForm, nome: e.target.value })
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 ml-1">Preço</label>
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  className="glass-input"
                  required
                  value={procedureForm.precoStr}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (!val) val = '0';
                    const floatVal = parseInt(val, 10) / 100;
                    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(floatVal);
                    setProcedureForm({ ...procedureForm, precoStr: formatted });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 ml-1">Duração (HH:mm)</label>
                <input
                  type="time"
                  className="glass-input"
                  required
                  value={procedureForm.duracao_hhmm}
                  onChange={(e) =>
                    setProcedureForm({ ...procedureForm, duracao_hhmm: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary mt-4">
                {editingId ? 'Salvar Alterações' : 'Salvar Procedimento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={openNewForm}
        className="fixed bottom-10 right-10 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Procedures;
