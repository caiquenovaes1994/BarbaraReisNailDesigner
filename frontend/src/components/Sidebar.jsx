import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Scissors, CalendarDays, DollarSign, Sparkles, LogOut, FileText, ChevronLeft, ChevronRight, ChevronsRight, ChevronsDown, ChevronsUp } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const links = [
    { to: '/dashboard', icon: <Home className="w-6 h-6 md:w-5 md:h-5" />, label: 'Início' },
    { to: '/schedule', icon: <CalendarDays className="w-6 h-6 md:w-5 md:h-5" />, label: 'Agenda' },
    { to: '/finance', icon: <DollarSign className="w-6 h-6 md:w-5 md:h-5" />, label: 'Financeiro' },
    { to: '/clients', icon: <User className="w-6 h-6 md:w-5 md:h-5" />, label: 'Clientes' },
    { to: '/procedures', icon: <Scissors className="w-6 h-6 md:w-5 md:h-5" />, label: 'Procedimentos' },
    { to: '/reports', icon: <FileText className="w-6 h-6 md:w-5 md:h-5" />, label: 'Relatórios' },
  ];

  return (
    <>
      <div className={`glass-panel fixed md:relative bottom-0 left-0 w-full m-0 md:m-4 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-8 z-[60] shrink-0 rounded-t-2xl rounded-b-none md:rounded-2xl border-t border-l-0 border-r-0 border-b-0 md:border pb-safe transition-all duration-500 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-64'} ${isMobileOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
        
        {/* Mobile Toggle Button (attached to menu) */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden absolute -top-10 left-4 bg-[#1e1e24] text-gray-300 px-4 py-2 rounded-t-xl border border-b-0 border-surface-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] flex items-center justify-center transition-colors"
        >
          {isMobileOpen ? <ChevronsDown size={24} className="text-primary" /> : <ChevronsUp size={24} className="text-primary" />}
        </button>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3.5 top-8 bg-[#1e1e24] text-gray-300 rounded-full p-1.5 border border-surface-border z-[60] hover:text-white hover:bg-white/10 transition-colors shadow-lg shadow-black/50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo Area */}
      <div className={`hidden md:flex flex-col items-center gap-1 text-primary drop-shadow-md text-center transition-all duration-500 overflow-hidden whitespace-nowrap ${isCollapsed ? 'mb-8 opacity-100' : 'mb-8 opacity-100'}`}>
        <Sparkles size={28} className={isCollapsed ? 'mb-0' : 'mb-2'} />
        <div className={`transition-all duration-500 flex flex-col items-center ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[100px] opacity-100'}`}>
          <h1 className="text-4xl font-imperial text-white">Bárbara Reis</h1>
          <h2 className="text-3xl font-imperial text-primary">Nail Designer</h2>
        </div>
      </div>
      
      <nav className="w-full px-2 md:px-4 flex flex-row md:flex-col gap-1 md:gap-2 justify-around md:justify-start">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={isCollapsed ? link.label : ""}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center justify-center gap-1 py-2 md:py-3 rounded-xl transition-all duration-300 flex-1 md:flex-none ${
                isCollapsed ? 'md:justify-center md:px-2' : 'md:justify-start md:px-4 md:gap-3'
              } ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/30 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-surface-border'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="p-1 md:p-0 flex items-center justify-center shrink-0">
                  {link.icon}
                </div>
                <span className={`text-[10px] md:text-base font-medium block mt-1 md:mt-0 transition-all duration-500 overflow-hidden whitespace-nowrap ${
                  isCollapsed ? 'md:max-w-0 md:opacity-0' : 'md:max-w-[150px] md:opacity-100'
                }`}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden md:flex flex-col items-center gap-4 w-full px-4 mb-4 overflow-hidden whitespace-nowrap">
        {onLogout && (
          <button 
            onClick={onLogout}
            title={isCollapsed ? "Sair" : ""}
            className={`flex items-center justify-center py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors ${
              isCollapsed ? 'w-10 h-10 px-0' : 'w-full gap-2 px-4'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`font-medium transition-all duration-500 overflow-hidden ${
              isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[100px] opacity-100'
            }`}>
              Sair
            </span>
          </button>
        )}
        <div className={`flex flex-col items-center text-[10px] text-gray-500 opacity-60 transition-all duration-500 ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
        }`}>
          <NavLink 
            to="/changelog" 
            className="mb-2 px-3 py-1 border border-primary/50 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors"
          >
            v 1.1.0
          </NavLink>
          <span>Desenvolvido por Caique Novaes</span>
          <span>2026</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
