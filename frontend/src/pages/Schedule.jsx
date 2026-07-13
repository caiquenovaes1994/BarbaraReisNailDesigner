import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentContextMenu from '../components/AppointmentContextMenu';

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  });

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

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Erro ao alterar status.');
    }
  };

  // Week navigation
  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };
  const currentWeek = () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({length: 13}, (_, i) => i + 8);

  // Get week end for display
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

  // Filter appointments for the current week
  const weekAppointments = appointments.filter(a => {
    const d = new Date(a.data_atendimento);
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return d >= currentWeekStart && d < nextWeekStart;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
          Agenda
        </h2>
        
        <div className="flex items-center gap-2 bg-surface-border p-1 rounded-xl">
          <button onClick={prevWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={currentWeek} className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
            <CalendarIcon size={16}/> Hoje
          </button>
          <button onClick={nextWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm">
        {currentWeekStart.toLocaleDateString('pt-BR')} até {currentWeekEnd.toLocaleDateString('pt-BR')}
      </p>

      {/* Calendar Grid */}
      <div className="flex-1 glass-panel overflow-auto relative custom-scrollbar">
        <div className="min-w-[800px] h-full flex flex-col">
          
          {/* Header Row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-surface-border sticky top-0 bg-background z-20">
            <div className="p-4 border-r border-surface-border"></div>
            {daysOfWeek.map((day, i) => {
              const date = new Date(currentWeekStart);
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

          {/* Time Rows and Appointments Overlay */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Grid Lines */}
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] group">
                <div className="p-2 text-right border-r border-b border-surface-border text-xs text-gray-500 font-medium h-[60px]">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {daysOfWeek.map((_, dayIndex) => {
                  const date = new Date(currentWeekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const todayObj = new Date();
                  todayObj.setHours(0,0,0,0);
                  const isPast = date < todayObj;
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-1 border-r border-b border-surface-border/50 h-[60px] group-hover:bg-white/[0.02] transition-colors ${isPast ? 'bg-black/20' : ''}`} 
                    />
                  );
                })}
              </div>
            ))}

            {/* Appointments Overlay */}
            <div className="absolute top-0 left-[60px] right-0 bottom-0 pointer-events-none flex">
              {daysOfWeek.map((_, dayIndex) => {
                const dayAppts = weekAppointments.filter(a => new Date(a.data_atendimento).getDay() === dayIndex);
                return (
                  <div key={dayIndex} className="flex-1 relative">
                    {dayAppts.map(appt => {
                      const d = new Date(appt.data_atendimento);
                      const startMinutes = (d.getHours() * 60) + d.getMinutes();
                      const gridStartMinutes = 8 * 60; // 8:00 AM
                      const top = startMinutes - gridStartMinutes;
                      const height = appt.duracao || 60;
                      
                      // Don't render if it starts before 8:00
                      if (top < 0) return null;
                      
                      let bgColor = 'bg-yellow-500 border border-yellow-600 shadow-md';
                      let textColor = 'text-yellow-950';
                      if (appt.status === 'Atendido' || appt.status === 'Concluido') {
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
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
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

export default Schedule;
