import React from 'react';

const GRADIENT_THEMES = {
  dark: 'from-slate-900 via-slate-800 to-indigo-950 text-white border-slate-700/60 shadow-slate-900/10',
  indigo: 'from-indigo-700 via-indigo-600 to-violet-700 text-white border-indigo-500/30 shadow-indigo-500/15',
  emerald: 'from-slate-900 via-emerald-950 to-slate-900 text-white border-emerald-500/30 shadow-emerald-900/10',
  purple: 'from-purple-900 via-slate-900 to-indigo-950 text-white border-purple-500/30 shadow-purple-900/10'
};

const BADGE_THEMES = {
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-400/30'
};

/**
 * Encabezado de página estandarizado y premium para STRONGYM
 */
const PageHeader = ({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  badgeColor = 'indigo',
  actions,
  gradient = 'dark'
}) => {
  const gradientClass = GRADIENT_THEMES[gradient] || GRADIENT_THEMES.dark;
  const badgeClass = BADGE_THEMES[badgeColor] || BADGE_THEMES.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 md:p-8 border shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${gradientClass}`}
    >
      {/* Glow de fondo decorativo */}
      <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {badge && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-xs ${badgeClass}`}
            >
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 shrink-0" />}
              <span>{badge}</span>
            </span>
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-xs">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Contenedor de Botones de Acción */}
      {actions && (
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
