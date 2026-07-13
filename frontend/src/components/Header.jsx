import { useState, useEffect } from 'react';

const Header = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  let weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  
  const displayString = `${weekday}, ${dateStr} - ${timeStr}`;

  return (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 text-right z-20 flex items-center justify-end">
      <div className="text-gray-400 font-medium text-xs md:text-base">{displayString}</div>
    </div>
  );
};

export default Header;
