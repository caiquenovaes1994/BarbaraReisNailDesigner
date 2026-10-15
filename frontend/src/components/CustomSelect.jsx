import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect
 * Seletor customizado com o design Lilás/Preto em degradê diagonal (glass-dropdown-panel).
 * Substitui o select nativo nos filtros, ordenações e opções de paginação ("Mostrar").
 * 
 * Props:
 * - value: string | number
 * - onChange: (newValue: any) => void
 * - options: Array<{ value: any, label: string }> | Array<string | number>
 * - placeholder: string
 * - disabled: boolean
 * - align: 'left' | 'right'
 * - className: string
 */
const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  disabled = false,
  align = 'left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normaliza opções
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt;
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`} ref={containerRef}>
      {/* Campo Inicial (Trigger) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`glass-input w-full flex items-center justify-between text-left cursor-pointer transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        } ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}
      >
        <span className="text-white text-sm font-medium truncate mr-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Painel com degradê lilás para preto 100% opaco */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 glass-dropdown-panel rounded-xl shadow-2xl z-[100] min-w-full w-24 sm:w-28 max-h-56 overflow-y-auto custom-scrollbar select-none animate-in fade-in zoom-in-95 duration-150 pointer-events-auto ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ backgroundColor: '#181126' }}
          onClick={(e) => e.stopPropagation()}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={String(opt.value)}
                onClick={() => handleSelect(opt.value)}
                className={`p-2 px-3 glass-dropdown-item cursor-pointer text-sm transition-colors border-b border-white/5 last:border-b-0 flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary/25 text-white font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="text-primary shrink-0 ml-1.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
