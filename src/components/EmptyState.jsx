import React from 'react';

/**
 * Estado vacío unificado para listas, tablas y catálogos
 */
const EmptyState = ({
  icon = '🔍',
  title = 'No encontramos resultados',
  description = 'Intenta cambiar los filtros o el término de búsqueda.',
  action = null
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-12 md:p-16 text-center shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
        {icon}
      </div>
      <h4 className="text-base font-black text-slate-900 tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
