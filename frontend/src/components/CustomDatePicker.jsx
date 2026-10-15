import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const applyDateMask = (val) => {
  const digits = (val || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const applyDateTimeMask = (val) => {
  const digits = (val || '').replace(/\D/g, '').slice(0, 12);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length <= 10) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} às ${digits.slice(8)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} às ${digits.slice(8, 10)}:${digits.slice(10)}`;
};

/**
 * CustomDatePicker
 * Calendário personalizado com o tema Lilás/Preto em degradê diagonal (glass-dropdown-panel).
 * Permite digitação manual direta no campo e seleção interativa pelo calendário.
 * 
 * Props:
 * - value: string no formato "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm"
 * - onChange: (newValue: string) => void
 * - withTime: boolean (opcional, ativa seleção de horário)
 * - placeholder: string
 * - required: boolean
 * - disabled: boolean
 * - align: 'left' | 'right' | 'auto'
 * - className: string
 */
const CustomDatePicker = ({
  value,
  onChange,
  withTime = false,
  placeholder,
  required = false,
  disabled = false,
  align = 'auto',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ horizontal: 'left', vertical: 'bottom' });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Parse inicial do valor para objeto Date
  const parseValue = (val) => {
    if (!val) return null;
    try {
      if (val.includes('T')) {
        const [dPart, tPart] = val.split('T');
        const [y, m, d] = dPart.split('-').map(Number);
        const [hh, mm] = (tPart || '09:00').split(':').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d, hh || 0, mm || 0);
      } else {
        const [y, m, d] = val.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d, 12, 0);
      }
    } catch {
      return null;
    }
  };

  const selectedDate = parseValue(value);

  // Formatação de exibição no campo de texto
  const getDisplayText = (dObj) => {
    const target = dObj !== undefined ? dObj : selectedDate;
    if (!target) return '';
    const d = String(target.getDate()).padStart(2, '0');
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const y = target.getFullYear();
    if (withTime) {
      const hh = String(target.getHours()).padStart(2, '0');
      const mm = String(target.getMinutes()).padStart(2, '0');
      return `${d}/${m}/${y} às ${hh}:${mm}`;
    }
    return `${d}/${m}/${y}`;
  };

  // Valor digitado manualmente pelo usuário
  const [inputValue, setInputValue] = useState(() => getDisplayText(selectedDate));

  // Mês e ano atualmente exibidos no calendário
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Horários quando withTime é true
  const [time, setTime] = useState(() => {
    if (selectedDate && withTime) {
      const hh = String(selectedDate.getHours()).padStart(2, '0');
      const mm = String(selectedDate.getMinutes()).padStart(2, '0');
      return { hours: hh, minutes: mm };
    }
    return { hours: '09', minutes: '00' };
  });

  // Sincroniza quando selectedDate muda externamente
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
      setInputValue(getDisplayText(selectedDate));
      if (withTime) {
        setTime({
          hours: String(selectedDate.getHours()).padStart(2, '0'),
          minutes: String(selectedDate.getMinutes()).padStart(2, '0')
        });
      }
    } else {
      setInputValue('');
    }
  }, [value, withTime]);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Altura compactada do calendário: ~295px com horário, ~255px sem horário
    const calendarHeight = withTime ? 295 : 255;
    const calendarWidth = 275;
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Se o espaço abaixo for insuficiente e houver mais espaço acima, abre para cima
    const vertical = (spaceBelow < calendarHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';
    
    let horizontal = 'left';
    if (align === 'right') {
      horizontal = 'right';
    } else if (align === 'left') {
      horizontal = 'left';
    } else {
      if (rect.left + calendarWidth > viewportWidth - 12) {
        horizontal = 'right';
      }
    }

    setDropdownPos({ horizontal, vertical });
  };

  // Fecha o dropdown ao clicar fora e gerencia posicionamento
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      updatePosition();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, align, withTime]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day, isOtherMonth, otherMonthOffset = 0) => {
    const targetDate = new Date(year, month + otherMonthOffset, day);
    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');

    if (withTime) {
      const formatted = `${yStr}-${mStr}-${dStr}T${time.hours}:${time.minutes}`;
      setInputValue(`${dStr}/${mStr}/${yStr} às ${time.hours}:${time.minutes}`);
      onChange?.(formatted);
    } else {
      const formatted = `${yStr}-${mStr}-${dStr}`;
      setInputValue(`${dStr}/${mStr}/${yStr}`);
      onChange?.(formatted);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (newHours, newMinutes) => {
    setTime({ hours: newHours, minutes: newMinutes });
    if (selectedDate) {
      const yStr = selectedDate.getFullYear();
      const mStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(selectedDate.getDate()).padStart(2, '0');
      const formatted = `${yStr}-${mStr}-${dStr}T${newHours}:${newMinutes}`;
      setInputValue(`${dStr}/${mStr}/${yStr} às ${newHours}:${newMinutes}`);
      onChange?.(formatted);
    }
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setViewDate(today);
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');

    if (withTime) {
      const formatted = `${yStr}-${mStr}-${dStr}T${time.hours}:${time.minutes}`;
      setInputValue(`${dStr}/${mStr}/${yStr} às ${time.hours}:${time.minutes}`);
      onChange?.(formatted);
    } else {
      const formatted = `${yStr}-${mStr}-${dStr}`;
      setInputValue(`${dStr}/${mStr}/${yStr}`);
      onChange?.(formatted);
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    onChange?.('');
    setIsOpen(false);
  };

  // Tratamento da digitação manual
  const handleInputChange = (e) => {
    if (withTime) {
      const masked = applyDateTimeMask(e.target.value);
      setInputValue(masked);

      if (masked.length === 19 && masked.includes(' às ') && masked.includes(':')) {
        const [dPart, tPart] = masked.split(' às ');
        const [d, m, y] = dPart.split('/').map(Number);
        const [hh, mm] = tPart.split(':').map(Number);
        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100 && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
          const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
          onChange?.(iso);
          setViewDate(new Date(y, m - 1, d, hh, mm));
          setTime({ hours: String(hh).padStart(2, '0'), minutes: String(mm).padStart(2, '0') });
        }
      }
    } else {
      const masked = applyDateMask(e.target.value);
      setInputValue(masked);

      if (masked.length === 10) {
        const [d, m, y] = masked.split('/').map(Number);
        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          onChange?.(iso);
          setViewDate(new Date(y, m - 1, d));
        }
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputValue || !inputValue.trim()) {
      setInputValue('');
      onChange?.('');
      return;
    }

    if (withTime) {
      if (inputValue.length === 19 && inputValue.includes(' às ') && inputValue.includes(':')) {
        const [dPart, tPart] = inputValue.split(' às ');
        const [d, m, y] = dPart.split('/').map(Number);
        const [hh, mm] = tPart.split(':').map(Number);
        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100 && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
          const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
          onChange?.(iso);
          return;
        }
      }
      setInputValue(getDisplayText(selectedDate));
    } else {
      if (inputValue.length === 10) {
        const [d, m, y] = inputValue.split('/').map(Number);
        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          onChange?.(iso);
          return;
        }
      }
      setInputValue(getDisplayText(selectedDate));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Dias da grade do calendário
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(i);
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push(i);
  }

  const isToday = (d, mOffset = 0) => {
    const now = new Date();
    const target = new Date(year, month + mOffset, d);
    return (
      now.getDate() === target.getDate() &&
      now.getMonth() === target.getMonth() &&
      now.getFullYear() === target.getFullYear()
    );
  };

  const isSelected = (d, mOffset = 0) => {
    if (!selectedDate) return false;
    const target = new Date(year, month + mOffset, d);
    return (
      selectedDate.getDate() === target.getDate() &&
      selectedDate.getMonth() === target.getMonth() &&
      selectedDate.getFullYear() === target.getFullYear()
    );
  };

  return (
    <div className={`relative ${isOpen ? 'z-[80]' : 'z-10'} ${className}`} ref={containerRef}>
      {/* Campo Inicial editável manualmente com botão de calendário */}
      <div
        className={`glass-input w-full flex items-center justify-between p-0 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        } ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (withTime ? 'DD/MM/AAAA às HH:mm' : 'DD/MM/AAAA')}
          className="w-full bg-transparent px-3 py-2 text-white text-sm font-medium tracking-wide outline-none disabled:cursor-not-allowed"
          title="Digite a data manualmente ou use o calendário"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="px-3 py-2 text-primary hover:text-primary-hover transition-colors shrink-0 cursor-pointer"
          title="Abrir calendário"
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* Lista suspensa do calendário (Painel compacto Lilás para Preto) */}
      {isOpen && (
        <div
          className={`absolute glass-dropdown-panel rounded-xl p-3 shadow-2xl z-[100] w-[265px] sm:w-[280px] max-w-[calc(100vw-1.5rem)] select-none animate-in fade-in zoom-in-95 duration-150 ${
            dropdownPos.vertical === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${
            dropdownPos.horizontal === 'right' ? 'right-0 left-auto' : 'left-0 sm:right-auto'
          }`}
          style={{ backgroundColor: '#181126' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho do Mês e Navegação */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-white capitalize tracking-wide">
              {MONTHS[month]} de {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
            {WEEKDAYS.map((w, idx) => (
              <span key={idx} className="text-[10px] font-semibold text-primary/80 uppercase">
                {w}
              </span>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {/* Dias do mês anterior */}
            {prevMonthDays.map((d) => (
              <button
                key={`prev-${d}`}
                type="button"
                onClick={() => handleSelectDay(d, true, -1)}
                className="h-7 w-full text-[11px] text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors flex items-center justify-center"
              >
                {d}
              </button>
            ))}

            {/* Dias do mês atual */}
            {currentMonthDays.map((d) => {
              const selected = isSelected(d, 0);
              const today = isToday(d, 0);

              let btnStyle = 'text-gray-200 hover:bg-white/10 hover:text-white';
              if (selected) {
                btnStyle = 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md shadow-primary/30 scale-105';
              } else if (today) {
                btnStyle = 'border border-primary text-primary font-bold hover:bg-primary/20';
              }

              return (
                <button
                  key={`curr-${d}`}
                  type="button"
                  onClick={() => handleSelectDay(d, false, 0)}
                  className={`h-7 w-full text-[11px] rounded transition-all font-medium flex items-center justify-center ${btnStyle}`}
                >
                  {d}
                </button>
              );
            })}

            {/* Dias do próximo mês */}
            {nextMonthDays.map((d) => (
              <button
                key={`next-${d}`}
                type="button"
                onClick={() => handleSelectDay(d, true, 1)}
                className="h-7 w-full text-[11px] text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors flex items-center justify-center"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Seleção de Horário (quando withTime = true) */}
          {withTime && (
            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-300 flex items-center gap-1 font-medium">
                <Clock size={13} className="text-primary" /> Horário:
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={time.hours}
                  onChange={(e) => handleTimeChange(e.target.value, time.minutes)}
                  className="bg-black/50 border border-primary/40 rounded px-1.5 py-0.5 text-white text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                    <option key={h} value={h} className="bg-[#171124] text-white">
                      {h}h
                    </option>
                  ))}
                </select>
                <span className="text-white font-bold text-xs">:</span>
                <select
                  value={time.minutes}
                  onChange={(e) => handleTimeChange(time.hours, e.target.value)}
                  className="bg-black/50 border border-primary/40 rounded px-1.5 py-0.5 text-white text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map((m) => (
                    <option key={m} value={m} className="bg-[#171124] text-white">
                      {m}m
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Limpar
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-2 py-0.5 rounded text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                Hoje
              </button>
              {withTime && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-0.5 rounded bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
