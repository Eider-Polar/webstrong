import React from 'react';

const STATUS_CONFIGS = {
  ACTIVE: {
    label: 'Activo',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  activo: {
    label: 'Activo',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  WARNING: {
    label: 'Por Vencer',
    classes: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
  },
  EXPIRED: {
    label: 'Vencido',
    classes: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  inactivo: {
    label: 'Inactivo',
    classes: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  PAUSED: {
    label: 'Pausado',
    classes: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  PENDING: {
    label: 'Pendiente',
    classes: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  DRAFT: {
    label: 'Borrador',
    classes: 'bg-amber-500 text-white border-amber-600'
  }
};

/**
 * Badge de Estado estandarizado
 */
const StatusBadge = ({ status, label: customLabel, size = 'sm' }) => {
  const normalizedKey = status ? String(status).toUpperCase() : 'INACTIVE';
  const config = STATUS_CONFIGS[normalizedKey] || STATUS_CONFIGS[status] || {
    label: customLabel || status || 'Desconocido',
    classes: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[9px]'
      : size === 'lg'
      ? 'px-3.5 py-1 text-xs'
      : 'px-2.5 py-1 text-[10px]';

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wider rounded-full border ${sizeClasses} ${config.classes}`}
    >
      {customLabel || config.label}
    </span>
  );
};

export default StatusBadge;
