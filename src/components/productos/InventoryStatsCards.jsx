import React from 'react';

/**
 * Tarjetas de Resumen KPI para el Almacén e Inventario
 */
export const InventoryStatsCards = ({ stats, stockFilter, setStockFilter }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Productos */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
          📦
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Productos</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalItems}</h3>
          <p className="text-[11px] text-slate-500 font-medium">{stats.totalUnits} unidades totales</p>
        </div>
      </div>

      {/* Card 2: Valor Estimado Almacén */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
          💵
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor en Almacén</p>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">
            ${stats.totalValue.toLocaleString('es-CO')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold">Precio de venta COP</p>
        </div>
      </div>

      {/* Card 3: Bajo Stock */}
      <div
        onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
        className={`p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${
          stockFilter === 'low'
            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
            : 'bg-white border-slate-200/90 hover:border-amber-300'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
          ⚠️
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bajo Stock (≤ 5)</p>
          <h3 className="text-2xl font-black text-amber-600 mt-0.5">{stats.lowStockCount}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Requieren reabastecer</p>
        </div>
      </div>

      {/* Card 4: Agotados */}
      <div
        onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
        className={`p-5 rounded-3xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${
          stockFilter === 'out'
            ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400'
            : 'bg-white border-slate-200/90 hover:border-rose-300'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
          🛑
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agotados (0 unids)</p>
          <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats.outOfStockCount}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Sin disponibilidad</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatsCards;
