import React from 'react';

/**
 * Extrae la letra inicial del primer nombre (ej: "Luis Fernando" -> "L").
 */
export const getInitialFromName = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim();
  if (!clean) return 'U';
  const firstWord = clean.split(/\s+/)[0];
  if (!firstWord) return 'U';
  return firstWord.charAt(0).toUpperCase();
};

/**
 * Componente UserAvatar
 * Muestra exclusivamente la letra inicial del primer nombre del usuario/rol
 * sin utilizar imágenes externas ni avatares fotográficos.
 */
const UserAvatar = ({
  name,
  role,
  size = 'md',
  className = '',
  title
}) => {
  const initial = getInitialFromName(name);

  // Mapeo de tamaños
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-2xl',
    lg: 'w-11 h-11 text-base rounded-2xl',
    xl: 'w-16 h-16 text-2xl rounded-2xl'
  };

  // Mapeo de estilos según el rol del usuario
  const roleStyles = {
    admin: 'bg-amber-100 text-amber-800 border-amber-300',
    worker: 'bg-sky-100 text-sky-800 border-sky-300',
    trainer: 'bg-sky-100 text-sky-800 border-sky-300',
    staff: 'bg-sky-100 text-sky-800 border-sky-300',
    client: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    socio: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };

  const normalizedRole = (role || 'default').toLowerCase();
  const colorClass = roleStyles[normalizedRole] || roleStyles.default;
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      title={title || name || 'Usuario'}
      className={`inline-flex items-center justify-center font-black tracking-tight border select-none shrink-0 shadow-2xs transition-all ${currentSizeClass} ${colorClass} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};

export default UserAvatar;
