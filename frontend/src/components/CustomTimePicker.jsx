import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

// Componente seletor de tempo
const CustomTimePicker = ({
  value = '01:00',
  onChange,
  placeholder = 'HH:mm',
  disabled = false,
  maxHours = 12,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ vertical: 'bottom', horizontal: 'right' });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Estado do input de texto
  const [inputValue, setInputValue] = useState(value || '01:00');

  const [hours, setHours] = useState(() => {
    if (value && value.includes(':')) {
      return value.split(':')[0].padStart(2, '0');
    }
    return '01';
  });

  const [minutes, setMinutes] = useState(() => {
    if (value && value.includes(':')) {
      return value.split(':')[1].padStart(2, '0');
    }
    return '00';
  });

  // Sincroniza valor externo
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      const normH = (h || '01').padStart(2, '0');
      const normM = (m || '00').padStart(2, '0');
      setHours(normH);
      setMinutes(normM);
      setInputValue(`${normH}:${normM}`);
    } else if (value) {
      setInputValue(value);
    }
  }, [value]);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const pickerHeight = 275;

    const vertical = (spaceBelow < pickerHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';
    setDropdownPos({ vertical, horizontal: 'right' });
  };

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
  }, [isOpen]);

  // Normaliza formato HH:mm
  const normalizeTime = (input) => {
    if (!input || typeof input !== 'string') return '01:00';
    const clean = input.trim().replace(/[^\d:]/g, '');
    if (!clean) return '01:00';

    if (!clean.includes(':')) {
      const num = parseInt(clean, 10);
      if (isNaN(num) || num <= 0) return '01:00';
      if (num <= 12) {
        return `${String(num).padStart(2, '0')}:00`;
      }
      const h = Math.floor(num / 60);
      const m = num % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const parts = clean.split(':');
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h) || h < 0) h = 1;
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^\d:]/g, '');
    if (val.length > 5) val = val.slice(0, 5);

    // Insere separador de hora
    if (val.length === 2 && !val.includes(':') && !inputValue.endsWith(':')) {
      val = val + ':';
    }

    setInputValue(val);

    // Atualiza ao completar formato válido
    if (/^\d{2}:\d{2}$/.test(val)) {
      const [h, m] = val.split(':');
      setHours(h);
      setMinutes(m);
      onChange?.(val);
    }
  };

  const handleInputBlur = () => {
    const formatted = normalizeTime(inputValue);
    setInputValue(formatted);
    const [h, m] = formatted.split(':');
    setHours(h);
    setMinutes(m);
    onChange?.(formatted);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectTime = (newH, newM) => {
    const formatted = `${newH}:${newM}`;
    setHours(newH);
    setMinutes(newM);
    setInputValue(formatted);
    onChange?.(formatted);
  };

  const PRESETS = [
    { label: '30 min', h: '00', m: '30' },
    { label: '45 min', h: '00', m: '45' },
    { label: '1h 00', h: '01', m: '00' },
    { label: '1h 15', h: '01', m: '15' },
    { label: '1h 30', h: '01', m: '30' },
    { label: '1h 45', h: '01', m: '45' },
    { label: '2h 00', h: '02', m: '00' },
    { label: '2h 30', h: '02', m: '30' },
    { label: '3h 00', h: '03', m: '00' }
  ];

  const hoursList = Array.from({ length: maxHours + 1 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className={`relative ${isOpen ? 'z-[70]' : 'z-10'} ${className}`} ref={containerRef}>
      {/* Campo de entrada e botão */}
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
          placeholder={placeholder || 'HH:mm'}
          className="w-full bg-transparent px-3 py-2 text-white text-sm font-semibold tracking-wider outline-none disabled:cursor-not-allowed"
          title="Digite o tempo manualmente (ex: 01:30)"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="px-2.5 py-2 text-primary hover:text-primary-hover transition-colors shrink-0 cursor-pointer"
          title="Abrir seletor rápido de tempo"
        >
          <Clock size={16} />
        </button>
      </div>

      {/* Painel de seleção de horário */}
      {isOpen && (
        <div
          className={`absolute glass-dropdown-panel rounded-xl p-3 shadow-2xl z-[100] w-64 max-w-[calc(100vw-1.5rem)] select-none animate-in fade-in zoom-in-95 duration-150 right-0 sm:right-0 ${
            dropdownPos.vertical === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          style={{ backgroundColor: '#181126' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Presets de duração */}
          <div className="mb-2.5 pb-2 border-b border-white/10">
            <span className="text-[10px] font-semibold text-primary/90 uppercase tracking-wider block mb-1.5">
              Durações Sugeridas
            </span>
            <div className="grid grid-cols-3 gap-1">
              {PRESETS.map((p) => {
                const isSelected = hours === p.h && minutes === p.m;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      handleSelectTime(p.h, p.m);
                      setIsOpen(false);
                    }}
                    className={`px-1.5 py-1 text-[11px] rounded transition-all font-medium text-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md shadow-primary/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colunas de horas e minutos */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            {/* Coluna de horas */}
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block text-center mb-1">
                Horas
              </span>
              <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 pr-0.5">
                {hoursList.map((h) => {
                  const active = hours === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectTime(h, minutes)}
                      className={`py-1 px-2 text-[11px] rounded text-center transition-all font-medium ${
                        active
                          ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-sm'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {h}h
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna de minutos */}
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block text-center mb-1">
                Minutos
              </span>
              <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 pr-0.5">
                {minutesList.map((m) => {
                  const active = minutes === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectTime(hours, m)}
                      className={`py-1 px-2 text-[11px] rounded text-center transition-all font-medium ${
                        active
                          ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-sm'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rodapé com ação de conclusão */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-primary font-bold">
              {hours}:{minutes}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-0.5 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
