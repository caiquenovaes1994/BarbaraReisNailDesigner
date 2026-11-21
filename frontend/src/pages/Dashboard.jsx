import { useState, useEffect, useRef } from 'react';
import { Bell, X, CalendarPlus, ChevronLeft, ChevronRight, Cake, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentContextMenu from '../components/AppointmentContextMenu';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const notificationsRef = useRef(null);
  const bellButtonRef = useRef(null);
  const navigate = useNavigate();

  const firstName = userName ? userName.split(' ')[0] : '';
  
  let emoji = '';
  if (firstName) {
    const norm = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (norm === 'barbara') emoji = '💅';
    if (norm === 'caique') emoji = '👨‍💻';
  }

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar agendamentos.');
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const dismissedBirthdays = JSON.parse(localStorage.getItem('dismissed_birthday_notifs') || '[]');
      const filtered = (res.data || []).filter(n => {
        if (n.type === 'birthday') {
          return !dismissedBirthdays.includes(n.id);
        }
        return true;
      });
      setNotifications(filtered);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar notificações.');
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUserName(res.data.nome || res.data.username || '');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAppointments();
    fetchNotifications();
  }, []);

  // Fecha popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const dismissNotification = async (e, notif) => {
    e.stopPropagation();
    if (notif.type === 'birthday') {
      try {
        const stored = JSON.parse(localStorage.getItem('dismissed_birthday_notifs') || '[]');
        if (!stored.includes(notif.id)) {
          stored.push(notif.id);
          localStorage.setItem('dismissed_birthday_notifs', JSON.stringify(stored));
        }
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
        toast.success('Notificação ignorada.');
      } catch (err) {
        console.error(err);
      }
      return;
    }
    try {
      await api.patch(`/appointments/${notif.appointmentId}/dismiss-notification`);
      fetchNotifications();
      toast.success('Notificação dispensada.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao dispensar notificação.');
    }
  };

  const handleBirthdayWhatsApp = (e, notif) => {
    e.stopPropagation();
    if (!notif.customerPhone) {
      toast.error('Cliente não possui telefone cadastrado.');
      return;
    }
    const cleanPhone = notif.customerPhone.replace(/\D/g, '');
    const ddi = notif.customerDdi || '55';
    const party = '\u{1F389}'; // Emoji festa
    const sparkles = '\u{2728}'; // Emoji brilho
    const cake = '\u{1F382}'; // Emoji bolo
    const nail = '\u{1F485}'; // Emoji unhas
    const firstName = (notif.customerName || '').trim().split(/\s+/)[0] || 'Cliente';

    let message = '';
    if (notif.isToday) {
      message = `Olá, ${firstName}! ${party}\nDesejamos a você um Feliz Aniversário repleto de realizações, saúde e beleza!\nBárbara Reis Nail Designer agradece seu carinho e presença! ${sparkles}${cake}`;
    } else {
      message = `Olá, ${firstName}! ${cake}\nSeu aniversário está chegando (${notif.formattedBirthDate})! Que tal agendar um horário para ficar ainda mais maravilhosa para o seu dia especial? ${nail}${sparkles}`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${ddi}${cleanPhone}&text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const openEditForm = (appt) => {
    setEditingAppointment(appt);
    setIsModalOpen(true);
  };

  const handleNotificationClick = (customerId) => {
    navigate(`/schedule?clienteId=${customerId}`);
  };

  const getReturnStatus = (appt) => {
    if (appt.status === 'Atendido') {
      return { label: appt.status, color: 'bg-green-500/20 text-green-400 border-green-500/50' };
    }
    if (appt.status === 'Cancelado') {
      return { label: appt.status, color: 'bg-red-500/20 text-red-400 border-red-500/50' };
    }
    if (appt.status === 'Agendado') {
      return { label: appt.status, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
    }
    // Status padrão
    return { label: appt.status, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
  };

  // Filtra agendamentos da data selecionada
  const todaysAllAppointments = appointments.filter(a => {
    const apptDate = new Date(a.data_atendimento);
    return (
      apptDate.getDate() === selectedDate.getDate() &&
      apptDate.getMonth() === selectedDate.getMonth() &&
      apptDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const todaysAppointments = todaysAllAppointments.filter(a => 
    a.status !== 'Atendido' && a.status !== 'Cancelado'
  );

  const atendidosHoje = todaysAllAppointments.filter(a => 
    a.status === 'Atendido'
  );

  // Ordena por horário
  const sortedAppointments = todaysAppointments.sort((a, b) => {
    return new Date(a.data_atendimento) - new Date(b.data_atendimento);
  });

  const sortedAtendidosHoje = atendidosHoje.sort((a, b) => {
    return new Date(a.data_atendimento) - new Date(b.data_atendimento);
  });

  const nextDate = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const prevDate = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const isTomorrow = (d) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
  };
  const isYesterday = (d) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return '(Hoje)';
    if (isTomorrow(selectedDate)) return '(Amanhã)';
    if (isYesterday(selectedDate)) return '(Ontem)';
    return `(${selectedDate.toLocaleDateString('pt-BR')})`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center relative">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {firstName ? `Olá, ${firstName}` : 'Início'}
          </span>
          {emoji && <span>{emoji}</span>}
        </h2>
        
        <div className="relative">
          <button 
            ref={bellButtonRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-surface border border-surface-border rounded-full hover:bg-surface-border transition-colors relative"
            title="Notificações"
          >
            <Bell size={20} className="text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </button>
          
          {showNotifications && (
            <div 
              ref={notificationsRef}
              className="absolute right-0 mt-2 w-88 max-w-[calc(100vw-2rem)] sm:w-96 glass-dropdown-panel rounded-2xl shadow-2xl z-50 flex flex-col max-h-[440px] overflow-hidden border border-[#9b87f5]/30 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-3.5 border-b border-[#9b87f5]/20 font-semibold text-white flex justify-between items-center bg-[#1e1e24]/70 backdrop-blur-md">
                <span className="flex items-center gap-2 text-sm">
                  <Bell size={16} className="text-[#9b87f5]" />
                  Notificações ({notifications.length})
                </span>
                {notifications.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#9b87f5]/20 text-[#c4b5fd] border border-[#9b87f5]/30">
                    {notifications.some(n => n.type === 'birthday') && notifications.some(n => n.type === 'return')
                      ? 'Retornos & Aniversários'
                      : notifications.some(n => n.type === 'birthday')
                      ? 'Aniversariantes'
                      : 'Retornos'}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="p-5 text-center text-gray-400 text-sm">Nenhuma notificação pendente.</p>
                ) : (
                  notifications.map(notif => {
                    const isBday = notif.type === 'birthday';
                    return (
                      <div 
                        key={notif.id || notif.appointmentId} 
                        className="p-4 border-b border-surface-border/50 hover:bg-white/5 transition-colors group relative"
                      >
                        <button 
                          onClick={(e) => dismissNotification(e, notif)}
                          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
                          title="Ignorar notificação"
                        >
                          <X size={15} />
                        </button>

                        {isBday ? (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {notif.isToday ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                  <Cake size={12} className="text-pink-400" /> Aniversário Hoje! 🎉
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  <Cake size={12} className="text-purple-400" /> Aniversário em {notif.daysLeft} {notif.daysLeft === 1 ? 'dia' : 'dias'} ({notif.formattedBirthDate})
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-200 pr-6">
                              <span className="font-semibold text-white">{notif.customerName}</span>{' '}
                              {notif.isToday 
                                ? 'está comemorando aniversário hoje! Deseje os parabéns.' 
                                : `faz aniversário em ${notif.daysLeft} ${notif.daysLeft === 1 ? 'dia' : 'dias'} (${notif.formattedBirthDate}). Agende para a comemoração.`}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              {notif.customerPhone && (
                                <button
                                  type="button"
                                  onClick={(e) => handleBirthdayWhatsApp(e, notif)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/40 text-xs font-medium transition-colors"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle size={13} />
                                  {notif.isToday ? 'Felicitar' : 'WhatsApp'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleNotificationClick(notif.customerId)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40 text-xs font-medium transition-colors"
                              >
                                <CalendarPlus size={13} /> Agendar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Retorno Pendente
                              </span>
                            </div>
                            <p className="text-sm text-gray-200 pr-6">
                              <span className="font-semibold text-white">{notif.customerName}</span> está pendente para retorno de {notif.procedureName}.
                            </p>
                            <p className={`text-xs mt-2 font-medium ${notif.daysLeft <= 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                              {notif.daysLeft <= 0 ? 'Atrasado' : `Faltam ${notif.daysLeft} dias`}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleNotificationClick(notif.customerId)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40 text-xs font-medium transition-colors"
                              >
                                <CalendarPlus size={13} /> Agendar Agora
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between gap-3">
            <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
              Clientes Previstos {getDateLabel()}
            </p>
            <div className="w-11 h-11 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
              <CalendarPlus size={22} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-4xl font-bold text-white">{todaysAppointments.length}</h3>
            <div className="flex items-center gap-1 bg-surface-border rounded-lg p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevDate} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors" title="Dia anterior">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextDate} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors" title="Próximo dia">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <p className="text-gray-400 text-sm font-medium">Clientes Atendidos {getDateLabel()}</p>
            <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-4xl font-bold text-white">{atendidosHoje.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-semibold border-b border-surface-border pb-2 mb-4 relative z-10">Agendamentos Previstos</h3>
          
          <div className="overflow-x-auto relative z-10">
            <table className="glass-table text-sm">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Procedimento</th>
                  <th>Horário</th>
                  <th>Valor</th>
                </tr>
              </thead>
            <tbody>
              {sortedAppointments.map(appt => {
                const status = getReturnStatus(appt);
                const dataAtendimento = new Date(appt.data_atendimento);
                
                return (
                  <tr 
                    key={appt.id} 
                    onClick={() => openEditForm(appt)}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, appointmentId: appt.id }); }}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="font-medium text-white">{appt.customer.nome}</td>
                    <td>{appt.procedure.nome}</td>
                    <td>{dataAtendimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>R$ {appt.valor_cobrado.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
                {sortedAppointments.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-gray-500 py-4">Nenhum agendamento pendente {isToday(selectedDate) ? 'para hoje' : `em ${selectedDate.toLocaleDateString('pt-BR')}`}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-semibold border-b border-surface-border pb-2 mb-4 relative z-10">Clientes Atendidos</h3>
          
          <div className="overflow-x-auto relative z-10">
            <table className="glass-table text-sm">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Procedimento</th>
                  <th>Horário</th>
                  <th>Valor</th>
                </tr>
              </thead>
            <tbody>
              {sortedAtendidosHoje.map(appt => {
                const status = { label: appt.status, color: 'bg-green-500/20 text-green-400 border-green-500/50' };
                const dataAtendimento = new Date(appt.data_atendimento);
                
                return (
                  <tr 
                    key={appt.id}
                    onClick={() => openEditForm(appt)}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, appointmentId: appt.id }); }}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="font-medium text-white">{appt.customer.nome}</td>
                    <td>{appt.procedure.nome}</td>
                    <td>{dataAtendimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>R$ {appt.valor_cobrado.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
                {sortedAtendidosHoje.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-gray-500 py-4">Nenhum atendimento finalizado {isToday(selectedDate) ? 'hoje' : `em ${selectedDate.toLocaleDateString('pt-BR')}`}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AppointmentContextMenu 
        contextMenu={contextMenu} 
        setContextMenu={setContextMenu} 
        onChangeStatus={fetchAppointments} 
      />

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        onSave={fetchAppointments}
      />
    </div>
  );
};

export default Dashboard;
