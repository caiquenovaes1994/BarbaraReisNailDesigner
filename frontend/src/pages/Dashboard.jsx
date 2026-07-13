import { useState, useEffect } from 'react';
import { Bell, X, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || '';
  const firstName = userName ? userName.split(' ')[0] : '';
  
  let emoji = '';
  if (firstName) {
    const norm = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (norm === 'barbara') emoji = '💅';
    if (norm === 'caique') emoji = '💻';
  }

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, []);

  const dismissNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.patch(`/appointments/${id}/dismiss-notification`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (customerId) => {
    navigate(`/schedule?clienteId=${customerId}`);
  };

  const getReturnStatus = (appt) => {
    if (appt.status === 'Atendido' || appt.status === 'Concluido') {
      return { label: appt.status, color: 'bg-green-500/20 text-green-400 border-green-500/50' };
    }
    if (appt.status === 'Cancelado') {
      return { label: appt.status, color: 'bg-red-500/20 text-red-400 border-red-500/50' };
    }
    if (appt.status === 'Agendado') {
      return { label: appt.status, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
    }
    // Pendente (padrão)
    return { label: appt.status, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
  };

  // Filtrar todos os agendamentos de HOJE
  const todaysAllAppointments = appointments.filter(a => {
    const today = new Date();
    const apptDate = new Date(a.data_atendimento);
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  });

  const todaysAppointments = todaysAllAppointments.filter(a => 
    a.status !== 'Concluido' && a.status !== 'Atendido' && a.status !== 'Cancelado'
  );

  const atendidosHoje = todaysAllAppointments.filter(a => 
    a.status === 'Concluido' || a.status === 'Atendido'
  );

  // Ordenar pelo horário
  const sortedAppointments = todaysAppointments.sort((a, b) => {
    return new Date(a.data_atendimento) - new Date(b.data_atendimento);
  });

  const sortedAtendidosHoje = atendidosHoje.sort((a, b) => {
    return new Date(a.data_atendimento) - new Date(b.data_atendimento);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center relative">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {firstName ? `Olá, ${firstName}` : 'Dashboard'}
          </span>
          {emoji && <span>{emoji}</span>}
        </h2>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-surface border border-surface-border rounded-full hover:bg-surface-border transition-colors relative"
          >
            <Bell size={20} className="text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:w-80 bg-[#1e1e24] border border-surface-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[400px] overflow-hidden">
              <div className="p-4 border-b border-surface-border font-semibold text-white flex justify-between items-center bg-surface/50">
                <span>Notificações ({notifications.length})</span>
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">Nenhuma notificação.</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.appointmentId} 
                      onClick={() => handleNotificationClick(notif.customerId)}
                      className="p-4 border-b border-surface-border/50 hover:bg-white/5 transition-colors cursor-pointer group relative"
                    >
                      <button 
                        onClick={(e) => dismissNotification(e, notif.appointmentId)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ignorar"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-sm text-gray-200">
                        <span className="font-semibold text-white">{notif.customerName}</span> está pendente para retorno de {notif.procedureName}.
                      </p>
                      <p className={`text-xs mt-2 ${notif.daysLeft <= 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {notif.daysLeft <= 0 ? 'Atrasado' : `Faltam ${notif.daysLeft} dias`}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <CalendarPlus size={14} /> Agendar Agora
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Clientes Previstos (Hoje)</p>
            <h3 className="text-3xl font-bold text-white mt-1">{todaysAppointments.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <CalendarPlus size={24} />
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Clientes Atendidos (Hoje)</p>
            <h3 className="text-3xl font-bold text-white mt-1">{atendidosHoje.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
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
                  <tr key={appt.id}>
                    <td className="font-medium text-white">{appt.customer.nome}</td>
                    <td>{appt.procedure.nome}</td>
                    <td>{dataAtendimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>R$ {appt.valor_cobrado.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
                {sortedAppointments.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-gray-500 py-4">Nenhum agendamento pendente para hoje</td></tr>
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
                  <tr key={appt.id}>
                    <td className="font-medium text-white">{appt.customer.nome}</td>
                    <td>{appt.procedure.nome}</td>
                    <td>{dataAtendimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>R$ {appt.valor_cobrado.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
                {sortedAtendidosHoje.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-gray-500 py-4">Nenhum atendimento finalizado hoje</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
