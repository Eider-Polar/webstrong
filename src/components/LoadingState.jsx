import React from 'react';

/**
 * Estado de carga con spinner y mensaje
 */
const LoadingState = ({ message = 'Cargando información...', color = 'indigo' }) => {
  const colorClass =
    color === 'emerald'
      ? 'border-emerald-600'
      : color === 'purple'
      ? 'border-purple-600'
      : 'border-indigo-600';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center shadow-xs">
      <div
        className={`w-10 h-10 border-4 ${colorClass} border-t-transparent rounded-full animate-spin mx-auto mb-3`}
      />
      <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
