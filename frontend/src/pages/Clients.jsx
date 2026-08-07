import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Check, Loader2, CornerUpRight, MapPin, Navigation, Car } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GoogleAddressAutocomplete from '../components/GoogleAddressAutocomplete';
import { countries } from '../utils/countries';
import api from '../utils/api';

const Clients = () => {
  const [customers, setCustomers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerForm, setCustomerForm] = useState({ nome: '', telefone: '', ddi: '55', data_nascimento: '', endereco: '' });
  
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [navModalOpen, setNavModalOpen] = useState(false);
  
  const normalizeString = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
  };

  const normalizedCountrySearch = normalizeString(countrySearch);
  const filteredCountries = countries.filter(c => 
    normalizeString(c.name).includes(normalizedCountrySearch) || 
    c.dial_code.includes(countrySearch)
  );

  const applyPhoneMask = (value, ddi) => {
    let v = value.replace(/\D/g, '');
    if (!v) return '';
    if (ddi === '55') {
      if (v.length <= 2) return `(${v}`;
      if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
      if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
      return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
    }
    if (ddi === '1') {
      if (v.length <= 3) return `(${v}`;
      if (v.length <= 6) return `(${v.slice(0, 3)}) ${v.slice(3)}`;
      return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6, 10)}`;
    }
    if (v.length <= 3) return `(${v}`;
    return `(${v.slice(0, 3)}) ${v.slice(3)}`;
  };
  
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomerForm({ ...customerForm, telefone: applyPhoneMask(raw, customerForm.ddi) });
  };
  
  const handleCountrySelect = (c) => {
    setCustomerForm({ ...customerForm, ddi: c.dial_code, telefone: applyPhoneMask(customerForm.telefone, c.dial_code) });
    setShowCountryDropdown(false);
  };
  
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const normalizedSearchQuery = normalizeString(searchQuery);
  const filteredCustomers = customers.filter(c => 
    normalizeString(c.nome).includes(normalizedSearchQuery) || 
    c.telefone.includes(searchQuery)
  );
  
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/customers?includeInactive=${showInactive}`);
      // Sort alphabetically by name
      const sorted = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
      setCustomers(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showInactive]);

  useEffect(() => {
    const handleClickOutside = () => setShowCountryDropdown(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setCustomerForm({ nome: '', telefone: '', ddi: '55', data_nascimento: '', endereco: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (customer) => {
    setEditingId(customer.id);
    setCustomerForm({ nome: customer.nome, telefone: applyPhoneMask(customer.telefone, customer.ddi || '55'), ddi: customer.ddi || '55', data_nascimento: customer.data_nascimento || '', endereco: customer.endereco || '' });
    setIsFormOpen(true);
  };

  const openHistoryModal = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const res = await api.get(`/customers/${customer.id}/history`);
      setCustomerHistory(res.data);
      setHistoryModalOpen(true);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao buscar histórico.');
    }
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...customerForm, telefone: customerForm.telefone.replace(/\D/g, '') };
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/customers', payload);
        toast.success('Cliente cadastrado com sucesso!');
      }
      setCustomerForm({ nome: '', telefone: '', ddi: '55', data_nascimento: '', endereco: '' });
      setEditingId(null);
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/customers/${deleteConfirmId}`);
      if (res.data.softDeleted) {
        toast.success(res.data.message); // Avisa que foi inativado
      } else {
        toast.success('Cliente excluído!');
      }
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir cliente.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleNavigate = () => {
    if (!customerForm.endereco) {
      toast.error('Preencha o endereço primeiro.');
      return;
    }
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      setNavModalOpen(true);
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(customerForm.endereco)}`, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Clientes
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
          Inativos
        </label>
      </div>

      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
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
                <th>Telefone</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((c) => (
                <tr key={c.id} className={!c.ativo ? 'opacity-60' : ''}>
                  <td className="font-medium">
                    <button 
                      onClick={() => openHistoryModal(c)}
                      className="text-white hover:text-primary hover:underline transition-colors text-left"
                    >
                      {c.nome}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://wa.me/${c.ddi || '55'}${c.telefone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-green-500 hover:text-green-400 transition-colors"
                        title="Abrir no WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                      </a>
                      <span className="text-gray-200">+{c.ddi || '55'} {applyPhoneMask(c.telefone, c.ddi || '55')}</span>
                    </div>
                  </td>
                  <td>
                    {c.ativo ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Inativo</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditForm(c)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-surface-border"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      {c.ativo && (
                        <button 
                          onClick={() => setDeleteConfirmId(c.id)}
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
              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-4">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 relative z-10">
          <span className="text-sm text-gray-400">
            Mostrando {filteredCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} registros
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
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            
            <form onSubmit={saveCustomer} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">
                  Nome do Cliente <span className="text-red-500" title="Campo obrigatório">*</span>
                </label>
                <input
                  placeholder="Nome do Cliente"
                  className="glass-input"
                  required
                  value={customerForm.nome}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, nome: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">Data de Nascimento</label>
                <input
                  type="date"
                  className="glass-input"
                  value={customerForm.data_nascimento || ''}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, data_nascimento: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">
                  Telefone / WhatsApp <span className="text-red-500" title="Campo obrigatório">*</span>
                </label>
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCountryDropdown(!showCountryDropdown);
                        setCountrySearch('');
                      }}
                      className="glass-input flex items-center justify-center gap-2 w-28 px-2"
                    >
                      <img 
                        src={`/flags/${countries.find(c => c.dial_code === customerForm.ddi)?.code || 'br'}.svg`} 
                        alt="Flag" 
                        className="w-5 h-auto rounded-sm object-cover"
                        onError={(e) => { e.target.style.display='none'; }}
                      />
                      <span className="text-sm">+{customerForm.ddi}</span>
                    </button>
                    
                    {showCountryDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e24] border border-surface-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[300px] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 border-b border-surface-border">
                          <input 
                            type="text" 
                            className="glass-input w-full py-2 px-3 text-sm"
                            placeholder="Buscar país ou DDI..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                          {filteredCountries.map(c => (
                            <button
                              type="button"
                              key={c.code}
                              onClick={() => handleCountrySelect(c)}
                              className="w-full text-left p-3 flex items-center gap-3 border-b border-surface-border/30 hover:bg-white/10 transition-colors"
                            >
                              <img 
                                src={`/flags/${c.code}.svg`} 
                                alt={c.name} 
                                className="w-5 h-auto rounded-sm object-cover"
                                onError={(e) => { e.target.style.display='none'; }}
                              />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm font-medium text-white line-clamp-1">{c.name}</span>
                                <span className="text-xs text-gray-400">+{c.dial_code}</span>
                              </div>
                              {customerForm.ddi === c.dial_code && <Check size={16} className="text-primary" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    placeholder="(XX) XXXXX-XXXX"
                    className="glass-input flex-1"
                    required
                    value={customerForm.telefone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">Endereço</label>
                <div className="flex gap-2">
                  <GoogleAddressAutocomplete
                    placeholder="Endereço"
                    className="glass-input flex-1"
                    value={customerForm.endereco || ''}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, endereco: e.target.value })
                    }
                    onPlaceSelected={(place) => {
                      if (place?.formatted_address) {
                        setCustomerForm(prev => ({ ...prev, endereco: place.formatted_address }));
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleNavigate}
                    className="bg-[#1e1e24] text-primary hover:bg-primary hover:text-white p-3 rounded-xl transition-colors border border-surface-border hover:border-primary flex items-center justify-center shrink-0 shadow-lg shadow-black/20"
                    title="Ir para o endereço"
                  >
                    <CornerUpRight size={20} />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="btn-primary mt-4 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : (editingId ? 'Salvar Alterações' : 'Salvar Cliente')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Client History */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel p-6 sm:p-8 w-full max-w-3xl relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">
              Histórico de Atendimentos: {selectedCustomer?.nome}
            </h3>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {customerHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum atendimento registrado.</p>
              ) : (
                <table className="glass-table w-full">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Procedimento</th>
                      <th>Status</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.map(appt => {
                      const dateObj = new Date(appt.data_atendimento);
                      return (
                        <tr key={appt.id}>
                          <td>{dateObj.toLocaleDateString('pt-BR')}</td>
                          <td>{dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>{appt.procedure?.nome}</td>
                          <td>
                            <span className={`px-2 py-1 rounded text-xs font-medium border
                              ${appt.status === 'Atendido' ? 'bg-green-500/20 text-green-400' : 
                                appt.status === 'Agendado' ? 'bg-yellow-500/20 text-yellow-400' : 
                                'bg-red-500/20 text-red-400'}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appt.valor_cobrado)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
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
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel p-6 w-full max-w-sm text-center shadow-2xl border border-red-500/20">
            <h3 className="text-xl font-bold text-white mb-2">Excluir Cliente</h3>
            <p className="text-gray-300 text-sm mb-6">
              Tem certeza que deseja remover este cliente? Se ele possuir agendamentos, será inativado.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-2 rounded-lg bg-surface border border-surface-border text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 font-medium disabled:opacity-50"
              >
                {isDeleting ? <><Loader2 size={18} className="animate-spin" /> Excluindo...</> : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation App Chooser Modal */}
      {navModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-0 sm:p-4" onClick={() => setNavModalOpen(false)}>
          <div className="glass-panel p-6 w-full max-w-sm bg-[#1e1e24] sm:rounded-2xl rounded-t-3xl rounded-b-none border-b-0 sm:border-b animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Como deseja ir?</h3>
              <button type="button" onClick={() => setNavModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(customerForm.endereco)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/50 transition-colors"
                onClick={() => setNavModalOpen(false)}
              >
                <div className="bg-black text-white p-2 rounded-full border border-gray-800"><Car size={20}/></div>
                <span className="font-medium text-white">Uber</span>
              </a>
              
              <a 
                href={`https://waze.com/ul?q=${encodeURIComponent(customerForm.endereco)}&navigate=yes`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/50 transition-colors"
                onClick={() => setNavModalOpen(false)}
              >
                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full"><Navigation size={20}/></div>
                <span className="font-medium text-white">Waze</span>
              </a>
              
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(customerForm.endereco)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/50 transition-colors"
                onClick={() => setNavModalOpen(false)}
              >
                <div className="bg-green-500/20 text-green-400 p-2 rounded-full"><MapPin size={20}/></div>
                <span className="font-medium text-white">Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;
