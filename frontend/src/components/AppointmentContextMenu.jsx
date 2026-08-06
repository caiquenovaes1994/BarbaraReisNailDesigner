import { useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const AppointmentContextMenu = ({ contextMenu, setContextMenu, onChangeStatus }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setContextMenu(null);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!menuRef.current) return;
        const buttons = Array.from(menuRef.current.querySelectorAll('button[role="menuitem"]'));
        const currentIndex = buttons.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          const nextIndex = (currentIndex + 1) % buttons.length;
          buttons[nextIndex]?.focus();
        } else {
          const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          buttons[prevIndex]?.focus();
        }
      }
    };

    // Auto focus first button on open
    const timer = setTimeout(() => {
      const firstBtn = menuRef.current?.querySelector('button[role="menuitem"]');
      firstBtn?.focus();
    }, 50);

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, setContextMenu]);

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setContextMenu(null);
      if (onChangeStatus) onChangeStatus();
      toast.success(`Status alterado para ${newStatus}!`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao alterar status.');
    }
  };

  if (!contextMenu) return null;

  // Viewport boundary collision protection
  const menuWidth = 200;
  const menuHeight = 150;
  const clampedX = Math.max(10, Math.min(contextMenu.x, (window.innerWidth || 320) - menuWidth - 10));
  const clampedY = Math.max(10, Math.min(contextMenu.y, (window.innerHeight || 480) - menuHeight - 10));

  const options = [
    {
      status: 'Agendado',
      label: 'Agendado',
      icon: Clock,
      colorClass: 'text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/15',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      status: 'Atendido',
      label: 'Atendido',
      icon: CheckCircle2,
      colorClass: 'text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/15',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      status: 'Cancelado',
      label: 'Cancelado',
      icon: XCircle,
      colorClass: 'text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/15',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
  ];

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Opções de status do atendimento"
      className="fixed z-50 bg-[#1e1e24]/95 backdrop-blur-md border border-surface-border/80 rounded-xl shadow-2xl p-1.5 w-52 text-sm text-gray-200 animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{ top: clampedY, left: clampedX }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase border-b border-surface-border/50 mb-1">
        Alterar Status
      </div>

      <div className="space-y-0.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.status}
              role="menuitem"
              tabIndex={0}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary/50 ${opt.colorClass}`}
              onClick={() => changeStatus(contextMenu.appointmentId, opt.status)}
            >
              <span className="flex items-center gap-2.5 font-medium">
                <Icon size={16} />
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentContextMenu;
