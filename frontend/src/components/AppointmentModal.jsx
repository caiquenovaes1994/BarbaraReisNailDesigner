import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import api from '../utils/api';
import { countries } from '../utils/countries';

const AppointmentModal = ({ isOpen, onClose, editingAppointment, onSave }) => {
  const [form, setForm] = useState({
    customerId: '',
    procedureId: '',
    data_atendimento: '',
    valorStr: '',
    dias_para_retorno: '',
    duracao_hhmm: '01:00'
  });
  
  const [customers, setCustomers] = useState([]);
  const [procedures, setProcedures] = useState([]);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ nome: '', telefone: '', ddi: '55', data_nascimento: '' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [isNewProcedureModalOpen, setIsNewProcedureModalOpen] = useState(false);
  const [newProcedureForm, setNewProcedureForm] = useState({ nome: '', precoStr: '', duracao: '', dias_retorno: '' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editingAppointment) {
      const dateObj = new Date(editingAppointment.data_atendimento);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
      
      const h = Math.floor(editingAppointment.duracao / 60).toString().padStart(2, '0');
      const m = (editingAppointment.duracao % 60).toString().padStart(2, '0');
      
      const formattedPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(editingAppointment.valor_cobrado);
      
      setForm({
        customerId: editingAppointment.customerId,
        procedureId: editingAppointment.procedureId,
        data_atendimento: localISOTime,
        valorStr: formattedPreco,
        dias_para_retorno: editingAppointment.dias_para_retorno || '',
        duracao_hhmm: `${h}:${m}`
      });
      
      setCustomerSearch(editingAppointment.customer?.nome || '');
    } else if (isOpen) {
      setForm({ customerId: '', procedureId: '', data_atendimento: '', valorStr: '', dias_para_retorno: '', duracao_hhmm: '01:00' });
      setCustomerSearch('');
    }
  }, [isOpen, editingAppointment]);

  const fetchData = async () => {
    try {
      const [cust, proc] = await Promise.all([
        api.get('/customers?includeInactive=false'),
        api.get('/procedures?includeInactive=false')
      ]);
      const sortedProcedures = proc.data.sort((a, b) => a.nome.localeCompare(b.nome));
      setCustomers(cust.data);
      setProcedures(sortedProcedures);
      
      // Se houver um agendamento em edição, atualiza a pesquisa com o nome correto caso a lista carregue depois
      if (editingAppointment && cust.data) {
        const c = cust.data.find(c => c.id === editingAppointment.customerId);
        if (c) setCustomerSearch(c.nome);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const normalizeString = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
  };

  const filteredCountries = countries.filter(c => 
    normalizeString(c.name).includes(normalizeString(countrySearch)) || 
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
    setNewCustomerForm({ ...newCustomerForm, telefone: applyPhoneMask(raw, newCustomerForm.ddi) });
  };

  const handleCountrySelect = (c) => {
    setNewCustomerForm({ ...newCustomerForm, ddi: c.dial_code, telefone: applyPhoneMask(newCustomerForm.telefone, c.dial_code) });
    setShowCountryDropdown(false);
  };

  const handleProcedureChange = (e, customProc = null) => {
    const procId = customProc ? customProc.id : parseInt(e.target.value);
    const proc = customProc || procedures.find(p => p.id === procId);
    if (proc) {
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.preco);
      const h = Math.floor(proc.duracao / 60).toString().padStart(2, '0');
      const m = (proc.duracao % 60).toString().padStart(2, '0');
      setForm({ ...form, procedureId: proc.id, valorStr: formatted, duracao_hhmm: `${h}:${m}` });
    } else {
      setForm({ ...form, procedureId: procId });
    }
  };

  const saveNewCustomer = async (e) => {
    e.preventDefault();
    const payload = { ...newCustomerForm, telefone: newCustomerForm.telefone.replace(/\D/g, '') };
    try {
      const res = await api.post('/customers', payload);
      setCustomers([...customers, res.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setForm({...form, customerId: res.data.id});
      setCustomerSearch(res.data.nome);
      setIsNewCustomerModalOpen(false);
      setNewCustomerForm({ nome: '', telefone: '', ddi: '55', data_nascimento: '' });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente');
    }
  };

  const saveNewProcedure = async (e) => {
    e.preventDefault();
    const precoValue = parseFloat(newProcedureForm.precoStr.replace(/[^\d,-]/g, '').replace(',', '.'));
    const payload = { ...newProcedureForm, preco: precoValue, ativo: true };
    if (!payload.preco) payload.preco = 0;
    try {
      const res = await api.post('/procedures', payload);
      const sortedProcedures = [...procedures, res.data].sort((a, b) => a.nome.localeCompare(b.nome));
      setProcedures(sortedProcedures);
      handleProcedureChange({ target: { value: res.data.id } }, res.data);
      setIsNewProcedureModalOpen(false);
      setNewProcedureForm({ nome: '', precoStr: '', duracao: '', dias_retorno: '' });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar procedimento');
    }
  };

  const saveAppointment = async (e) => {
    e.preventDefault();
    if (!form.customerId) {
      alert('Por favor, pesquise e selecione um cliente da lista.');
      return;
    }
    const [h, m] = form.duracao_hhmm.split(':');
    const duracao = parseInt(h) * 60 + parseInt(m);
    const precoValue = parseFloat(form.valorStr.replace(/[^\d,-]/g, '').replace(',', '.'));
    const payload = { ...form, duracao, valor_cobrado: precoValue };
    
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert(err.response?.data?.error || 'Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/appointments/${editingAppointment.id}`);
      setShowDeleteConfirm(false);
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir agendamento.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => {setShowCustomerDropdown(false); setShowCountryDropdown(false)}}>
        <div className="glass-panel p-6 sm:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">
            {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          
          <form onSubmit={saveAppointment} className="flex flex-col gap-4">
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  className="glass-input w-full"
                  placeholder="Pesquisar Cliente..."
                  required
                  value={customerSearch}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setForm({...form, customerId: ''});
                    setShowCustomerDropdown(true);
                  }}
                />
                {showCustomerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e24] border border-surface-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
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
              <button 
                type="button" 
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="px-3 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 hover:text-white transition-colors border border-primary/30 backdrop-blur-sm"
                title="Novo Cliente"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <select className="glass-input bg-background/90 flex-1" required value={form.procedureId} onChange={handleProcedureChange}>
                <option value="" disabled className="bg-[#1e1e24] text-white">Selecione o Procedimento</option>
                {procedures.map(p => <option key={p.id} value={p.id} className="bg-[#1e1e24] text-white">{p.nome}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => setIsNewProcedureModalOpen(true)}
                className="px-3 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 hover:text-white transition-colors border border-primary/30 backdrop-blur-sm"
                title="Novo Procedimento"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-[60%]">
                <label className="text-xs text-gray-400 ml-1">Data e Hora</label>
                <input type="datetime-local" className="glass-input" required value={form.data_atendimento} onChange={e => setForm({...form, data_atendimento: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1 w-[40%]">
                <label className="text-xs text-gray-400 ml-1">Tempo (HH:mm)</label>
                <input type="time" className="glass-input" required value={form.duracao_hhmm} onChange={e => setForm({...form, duracao_hhmm: e.target.value})} />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-xs text-gray-400 ml-1">Valor Cobrado</label>
                <input 
                  type="text" 
                  placeholder="R$ 0,00"
                  className="glass-input" 
                  required 
                  value={form.valorStr} 
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (!val) val = '0';
                    const floatVal = parseInt(val, 10) / 100;
                    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(floatVal);
                    setForm({ ...form, valorStr: formatted });
                  }} 
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-xs text-gray-400 ml-1">Retorno (Dias) - Opcional</label>
                <input type="number" className="glass-input" value={form.dias_para_retorno} onChange={e => setForm({...form, dias_para_retorno: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button type="submit" className="btn-primary flex-1">
                Salvar Agendamento
              </button>
              {editingAppointment && (
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="px-6 py-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium border border-red-500/50"
                >
                  Excluir
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel p-6 w-full max-w-sm text-center shadow-2xl border border-red-500/20">
            <h3 className="text-xl font-bold text-white mb-2">Excluir Agendamento</h3>
            <p className="text-gray-300 text-sm mb-6">
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-2 rounded-lg bg-surface border border-surface-border text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 font-medium"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setShowCountryDropdown(false)}>
          <div className="glass-panel p-6 sm:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsNewCustomerModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">Novo Cliente</h3>
            <form onSubmit={saveNewCustomer} className="flex flex-col gap-4">
              <input
                placeholder="Nome do Cliente"
                className="glass-input"
                required
                value={newCustomerForm.nome}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, nome: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">Data de Nascimento (opcional)</label>
                <input
                  type="date"
                  className="glass-input"
                  value={newCustomerForm.data_nascimento || ''}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, data_nascimento: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 ml-1">Telefone / WhatsApp</label>
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
                        src={`/flags/${countries.find(c => c.dial_code === newCustomerForm.ddi)?.code || 'br'}.svg`} 
                        alt="Flag" 
                        className="w-5 h-auto rounded-sm object-cover"
                        onError={(e) => { e.target.style.display='none'; }}
                      />
                      <span className="text-sm">+{newCustomerForm.ddi}</span>
                    </button>
                    {showCountryDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e24] border border-surface-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[200px] overflow-hidden"
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
                              <img src={`/flags/${c.code}.svg`} alt={c.name} className="w-5 h-auto rounded-sm object-cover" onError={(e) => { e.target.style.display='none'; }} />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm font-medium text-white line-clamp-1">{c.name}</span>
                                <span className="text-xs text-gray-400">+{c.dial_code}</span>
                              </div>
                              {newCustomerForm.ddi === c.dial_code && <Check size={16} className="text-primary" />}
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
                    value={newCustomerForm.telefone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary mt-4">Salvar e Selecionar</button>
            </form>
          </div>
        </div>
      )}

      {isNewProcedureModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="glass-panel p-6 sm:p-8 w-full max-w-md relative">
            <button 
              onClick={() => setIsNewProcedureModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">Novo Procedimento</h3>
            <form onSubmit={saveNewProcedure} className="flex flex-col gap-4">
              <input
                placeholder="Nome do Procedimento"
                className="glass-input"
                required
                value={newProcedureForm.nome}
                onChange={(e) => setNewProcedureForm({ ...newProcedureForm, nome: e.target.value })}
              />
              <div className="flex gap-4">
                <input
                  placeholder="Preço (R$)"
                  className="glass-input flex-1"
                  required
                  value={newProcedureForm.precoStr}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (!val) val = '0';
                    const floatVal = parseInt(val, 10) / 100;
                    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(floatVal);
                    setNewProcedureForm({ ...newProcedureForm, precoStr: formatted });
                  }}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-400 ml-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    placeholder="Minutos"
                    className="glass-input"
                    required
                    value={newProcedureForm.duracao}
                    onChange={(e) => setNewProcedureForm({ ...newProcedureForm, duracao: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-400 ml-1">Retorno (Dias)</label>
                  <input
                    type="number"
                    placeholder="Opcional"
                    className="glass-input"
                    value={newProcedureForm.dias_retorno}
                    onChange={(e) => setNewProcedureForm({ ...newProcedureForm, dias_retorno: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary mt-4">Salvar e Selecionar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentModal;
