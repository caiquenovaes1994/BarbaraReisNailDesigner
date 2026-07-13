import { useEffect } from 'react';
import api from '../utils/api';

const AppointmentContextMenu = ({ contextMenu, setContextMenu, onChangeStatus }) => {
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [setContextMenu]);

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setContextMenu(null);
      if (onChangeStatus) onChangeStatus();
    } catch (e) {
      console.error(e);
      alert('Erro ao alterar status.');
    }
  };

  if (!contextMenu) return null;

  return (
    <div 
      className="fixed z-50 bg-[#1e1e24] border border-surface-border rounded-lg shadow-2xl py-2 w-48 text-sm text-gray-200 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-yellow-400" onClick={() => changeStatus(contextMenu.appointmentId, 'Pendente')}>
        Pendente
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-green-400" onClick={() => changeStatus(contextMenu.appointmentId, 'Atendido')}>
        Atendido
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-red-400" onClick={() => changeStatus(contextMenu.appointmentId, 'Cancelado')}>
        Cancelado
      </button>
    </div>
  );
};

export default AppointmentContextMenu;
