import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlignLeft, CalendarDays, LayoutGrid } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentContextMenu from '../components/AppointmentContextMenu';

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  
  const [view, setView] = useState('week'); // 'day', 'week', 'month', 'list'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = async () => {
    try {
      const appts = await api.get('/appointments');
      setAppointments(appts.data);

      const customerIdFromUrl = searchParams.get('clienteId');
      if (customerIdFromUrl) {
        setEditingAppointment({ customerId: parseInt(customerIdFromUrl) });
        setIsModalOpen(true);
        setSearchParams({});
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const openNewForm = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const openEditForm = (appt) => {
    setEditingAppointment(appt);
    setIsModalOpen(true);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else if (view === 'month') d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'day') d.setDate(d.getDate() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else if (view === 'month') d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const goToToday = () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    setCurrentDate(d);
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({length: 13}, (_, i) => i + 8);

  // Helper function to get week start
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const renderDayView = () => {
    const targetDateStr = currentDate.toDateString();
    const dayAppts = appointments.filter(a => new Date(a.data_atendimento).toDateString() === targetDateStr);
    
    return (
      <div className="flex-1 glass-panel overflow-auto relative custom-scrollbar">
        <div className="min-w-[600px] h-full flex flex-col">
          <div className="grid grid-cols-[60px_1fr] border-b border-surface-border sticky top-0 bg-background z-20">
            <div className="p-4 border-r border-surface-border"></div>
            <div className={`p-4 text-center border-r border-surface-border font-medium ${new Date().toDateString() === targetDateStr ? 'text-primary bg-primary/5' : 'text-gray-300'}`}>
              <div className="text-sm uppercase tracking-wider">{daysOfWeek[currentDate.getDay()]}</div>
              <div className="text-2xl mt-1 font-bold">{currentDate.getDate()}</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[60px_1fr] group">
                <div className="p-2 text-right border-r border-b border-surface-border text-xs text-gray-500 font-medium h-[60px]">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="p-1 border-r border-b border-surface-border/50 h-[60px] group-hover:bg-white/[0.02] transition-colors" />
              </div>
            ))}
            
            <div className="absolute top-0 left-[60px] right-0 bottom-0 pointer-events-none flex">
              <div className="flex-1 relative">
                {dayAppts.map(appt => renderAppointmentBlock(appt, 8 * 60))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    const weekAppointments = appointments.filter(a => {
      const d = new Date(a.data_atendimento);
      return d >= weekStart && d < nextWeekStart;
    });

    return (
      <div className="flex-1 glass-panel overflow-auto relative custom-scrollbar">
        <div className="min-w-[800px] h-full flex flex-col">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-surface-border sticky top-0 bg-background z-20">
            <div className="p-4 border-r border-surface-border"></div>
            {daysOfWeek.map((day, i) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + i);
              const todayObj = new Date();
              const isToday = todayObj.toDateString() === date.toDateString();
              todayObj.setHours(0,0,0,0);
              const isPast = date < todayObj;
              
              return (
                <div key={day} className={`p-4 text-center border-r border-surface-border font-medium ${isToday ? 'text-primary bg-primary/5' : (isPast ? 'text-gray-500 bg-black/20' : 'text-gray-300')}`}>
                  <div className="text-sm uppercase tracking-wider">{day}</div>
                  <div className={`text-2xl mt-1 ${isToday ? 'font-bold' : ''}`}>{date.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] group">
                <div className="p-2 text-right border-r border-b border-surface-border text-xs text-gray-500 font-medium h-[60px]">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {daysOfWeek.map((_, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const todayObj = new Date();
                  todayObj.setHours(0,0,0,0);
                  const isPast = date < todayObj;
                  return (
                    <div key={dayIndex} className={`p-1 border-r border-b border-surface-border/50 h-[60px] group-hover:bg-white/[0.02] transition-colors ${isPast ? 'bg-black/20' : ''}`} />
                  );
                })}
              </div>
            ))}

            <div className="absolute top-0 left-[60px] right-0 bottom-0 pointer-events-none flex">
              {daysOfWeek.map((_, dayIndex) => {
                const dayAppts = weekAppointments.filter(a => new Date(a.data_atendimento).getDay() === dayIndex);
                return (
                  <div key={dayIndex} className="flex-1 relative">
                    {dayAppts.map(appt => renderAppointmentBlock(appt, 8 * 60))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const days = [];
    for(let i = 0; i < firstDay; i++) days.push(null);
    for(let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    return (
      <div className="flex-1 glass-panel flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-7 border-b border-surface-border bg-background">
          {daysOfWeek.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 uppercase border-r border-surface-border last:border-0">{day}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {days.map((date, idx) => {
            if(!date) return <div key={idx} className="border-r border-b border-surface-border bg-black/10"></div>;
            
            const isToday = date.getTime() === today.getTime();
            const dateStr = date.toDateString();
            const dayAppts = appointments.filter(a => new Date(a.data_atendimento).toDateString() === dateStr).sort((a,b) => new Date(a.data_atendimento) - new Date(b.data_atendimento));
            
            return (
              <div key={idx} className={`p-2 border-r border-b border-surface-border overflow-y-auto custom-scrollbar flex flex-col gap-1 ${isToday ? 'bg-primary/5' : ''}`}>
                <div className={`text-right text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                  {date.getDate()}
                </div>
                {dayAppts.map(appt => {
                  let bgColor = 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
                  if (appt.status === 'Atendido') {
                    bgColor = 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
                  } else if (appt.status === 'Cancelado') {
                    bgColor = 'bg-red-500/20 text-red-400 hover:bg-red-500/30 line-through';
                  }
                  
                  return (
                    <div 
                      key={appt.id} 
                      className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${bgColor}`}
                      title={`${appt.customer?.nome || ''} - ${appt.procedure?.nome || ''} - ${new Date(appt.data_atendimento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} (${appt.status})`}
                      onClick={() => openEditForm(appt)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, appointmentId: appt.id });
                      }}
                    >
                      {new Date(appt.data_atendimento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {appt.customer?.nome || appt.customer?.name}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const futureAppts = appointments.filter(a => new Date(a.data_atendimento) >= today)
                                    .sort((a, b) => new Date(a.data_atendimento) - new Date(b.data_atendimento));
    
    const grouped = futureAppts.reduce((acc, appt) => {
      const d = new Date(appt.data_atendimento);
      d.setHours(0,0,0,0);
      const key = d.getTime();
      if(!acc[key]) acc[key] = [];
      acc[key].push(appt);
      return acc;
    }, {});
    
    const sortedKeys = Object.keys(grouped).sort((a,b) => a - b);
    
    if(sortedKeys.length === 0) {
      return (
        <div className="flex-1 glass-panel flex items-center justify-center text-gray-400">
          Nenhum agendamento futuro.
        </div>
      );
    }
    
    return (
      <div className="flex-1 overflow-auto custom-scrollbar space-y-6 pb-6 pr-2">
        {sortedKeys.map(timestamp => {
          const date = new Date(parseInt(timestamp));
          const isToday = date.getTime() === today.getTime();
          const list = grouped[timestamp];
          
          return (
            <div key={timestamp} className="glass-panel p-6">
              <h3 className={`text-lg font-bold mb-4 border-b border-surface-border pb-2 ${isToday ? 'text-primary' : 'text-white'}`}>
                {isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map(appt => (
                  <div 
                    key={appt.id} 
                    className="bg-surface-border/30 p-4 rounded-xl border border-surface-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => openEditForm(appt)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({ x: e.clientX, y: e.clientY, appointmentId: appt.id });
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">{new Date(appt.data_atendimento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${appt.status === 'Atendido' ? 'bg-green-500/20 text-green-400' : appt.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="font-medium text-gray-200">{appt.customer.nome}</div>
                    <div className="text-sm text-gray-400 mt-1">{appt.procedure.nome}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAppointmentBlock = (appt, gridStartMinutes) => {
    const d = new Date(appt.data_atendimento);
    const startMinutes = (d.getHours() * 60) + d.getMinutes();
    const top = startMinutes - gridStartMinutes;
    const height = appt.duracao || 60;
    
    if (top < 0) return null;
    
    let bgColor = 'bg-yellow-500 border border-yellow-600 shadow-md';
    let textColor = 'text-yellow-950';
    if (appt.status === 'Atendido') {
      bgColor = 'bg-green-600 border border-green-700 shadow-md';
      textColor = 'text-white';
    } else if (appt.status === 'Cancelado') {
      bgColor = 'bg-red-600 border border-red-700 shadow-md opacity-80';
      textColor = 'text-white line-through';
    }
    
    return (
      <div 
        key={appt.id} 
        className={`absolute left-1 right-1 p-2 rounded-lg text-xs overflow-hidden cursor-pointer pointer-events-auto transition-transform hover:scale-[1.02] z-10 ${bgColor}`}
        style={{ top: `${top}px`, height: `${height}px` }}
        title={`${appt.customer.nome} - ${appt.procedure.nome} - ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`}
        onClick={(e) => { e.stopPropagation(); openEditForm(appt); }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, appointmentId: appt.id });
        }}
      >
        <div className={`font-bold ${textColor}`}>{appt.customer.nome}</div>
        <div className={`mt-0.5 opacity-90 ${textColor}`}>{appt.procedure.nome}</div>
        <div className={`mt-1 font-medium opacity-80 ${textColor}`}>{d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {appt.status}</div>
      </div>
    );
  };

  const getSubtitle = () => {
    if (view === 'day') return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('pt-BR')} até ${weekEnd.toLocaleDateString('pt-BR')}`;
    }
    if (view === 'month') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (view === 'list') return 'A partir de hoje';
    return '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
            Agenda
          </h2>
          <p className="text-gray-400 text-sm capitalize mt-1">
            {getSubtitle()}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* View Selector */}
          <div className="flex items-center bg-surface-border p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => setView('day')} className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none ${view === 'day' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-400'}`} title="Dia">
              <CalendarDays size={18} /> <span className="hidden md:inline">Dia</span>
            </button>
            <button onClick={() => setView('week')} className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none ${view === 'week' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-400'}`} title="Semana">
              <CalendarIcon size={18} /> <span className="hidden md:inline">Semana</span>
            </button>
            <button onClick={() => setView('month')} className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none ${view === 'month' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-400'}`} title="Mês">
              <LayoutGrid size={18} /> <span className="hidden md:inline">Mês</span>
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none ${view === 'list' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-400'}`} title="Agenda Contínua">
              <AlignLeft size={18} /> <span className="hidden md:inline">Lista</span>
            </button>
          </div>

          {/* Navigation */}
          {view !== 'list' && (
            <div className="flex items-center justify-center gap-2 bg-surface-border p-1 rounded-xl w-full sm:w-auto">
              <button onClick={prevPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={goToToday} className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 flex-1 sm:flex-none">
                Hoje
              </button>
              <button onClick={nextPeriod} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </div>

      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'list' && renderListView()}
      
      <AppointmentContextMenu 
        contextMenu={contextMenu} 
        setContextMenu={setContextMenu} 
        onChangeStatus={fetchData} 
      />

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAppointment={editingAppointment}
        onSave={fetchData}
      />

      <button
        onClick={openNewForm}
        className="fixed bottom-10 right-10 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Schedule;
