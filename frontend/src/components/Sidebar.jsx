import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Scissors, CalendarDays, DollarSign, Sparkles, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const links = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5" />, label: 'Dashboard' },
    { to: '/schedule', icon: <CalendarDays className="w-6 h-6 md:w-5 md:h-5" />, label: 'Agenda' },
    { to: '/finance', icon: <DollarSign className="w-6 h-6 md:w-5 md:h-5" />, label: 'Financeiro' },
    { to: '/clients', icon: <User className="w-6 h-6 md:w-5 md:h-5" />, label: 'Clientes' },
    { to: '/procedures', icon: <Scissors className="w-6 h-6 md:w-5 md:h-5" />, label: 'Procedimentos' },
  ];

  return (
    <div className="glass-panel fixed md:relative bottom-0 left-0 w-full md:w-64 m-0 md:m-4 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-8 z-50 shrink-0 rounded-t-2xl rounded-b-none md:rounded-2xl border-t border-l-0 border-r-0 border-b-0 md:border pb-safe">
      <div className="hidden md:flex flex-col items-center gap-1 mb-8 text-primary drop-shadow-md text-center">
        <Sparkles size={28} className="mb-2" />
        <h1 className="text-4xl font-imperial text-white">Bárbara Reis</h1>
        <h2 className="text-3xl font-imperial text-primary">Nail Designer</h2>
      </div>
      
      <nav className="w-full px-2 md:px-4 flex flex-row md:flex-col gap-1 md:gap-2 justify-around md:justify-start">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300 flex-1 md:flex-none ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/30 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-surface-border'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="p-1 md:p-0 flex items-center justify-center">
                  {link.icon}
                </div>
                <span className="text-[10px] md:text-base font-medium hidden sm:block md:block mt-1 md:mt-0">
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden md:flex flex-col items-center gap-4 w-full px-4 mb-4">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        )}
        <div className="flex flex-col items-center text-[10px] text-gray-500 opacity-60">
          <span>Desenvolvido por Caique Novaes</span>
          <span>2026</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
