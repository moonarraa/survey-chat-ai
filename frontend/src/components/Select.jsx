import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Select({ value, onValueChange, options, placeholder = 'Выберите...', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className={`
          flex items-center justify-between w-full
          rounded-xl border border-gray-300 bg-white px-4 py-2
          text-base font-medium shadow-sm
          transition focus:outline-none focus:ring-2 focus:ring-primary-500
          hover:border-primary-400
          ${open ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        `}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''} text-gray-400`} />
      </button>
      {open && createPortal(
        <ul style={dropdownStyle} className={`
          absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl
          max-h-60 overflow-auto py-1 animate-fade-in
        `} tabIndex={-1} role="listbox">
          {options.map(opt => (
            <li
              key={opt.value}
              className={`
                flex items-center px-4 py-2 cursor-pointer
                transition
                ${value === opt.value
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-900'}
                rounded
              `}
              onClick={() => { onValueChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
              {value === opt.value && <Check className="w-5 h-5 ml-auto text-primary-600" />}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
} 