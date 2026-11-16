import React from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

/**
 * Barra unificada de búsqueda y filtros por categoría
 */
const SearchFilterBar = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  extraControls = null
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
      {/* Pills de Categorías */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory?.(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Controles del lado derecho: Buscador y extras */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {extraControls}

        {onSearchChange && (
          <div className="w-full md:w-80 relative">
            <HiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <HiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
