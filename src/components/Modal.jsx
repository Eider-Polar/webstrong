import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[95vw]'
};

const BADGE_COLOR_CLASSES = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
};

/**
 * Componente de Modal Universal y Accesible para STRONGYM
 * Utilizado de manera consistente en los 3 roles (Admin, Worker, Client).
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeColor = 'indigo',
  maxWidth = 'lg',
  showCloseButton = true,
  closeOnClickOutside = true,
  children,
  footer
}) => {
  // Cerrar modal al presionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll de fondo mientras el modal está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth] || MAX_WIDTH_CLASSES.lg;
  const badgeColorClass = BADGE_COLOR_CLASSES[badgeColor] || BADGE_COLOR_CLASSES.indigo;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={closeOnClickOutside ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white border border-slate-200/90 rounded-3xl w-full ${maxWidthClass} shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <HiX className="w-5 h-5" />
          </button>
        )}

        {/* Encabezado opcional */}
        {(title || badge) && (
          <div className="p-6 md:p-7 pb-4 border-b border-slate-100 pr-12">
            {badge && (
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border mb-2 ${badgeColorClass}`}
              >
                {badge}
              </span>
            )}
            {title && (
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="p-6 md:p-7 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>

        {/* Pie de modal opcional */}
        {footer && (
          <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
