import React from 'react';
import EmptyState from '../EmptyState';
import LoadingState from '../LoadingState';
import { HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';

/**
 * Tabla detallada de Inventario y Existencias
 */
export const InventoryTable = ({
  products,
  loading,
  isAdmin,
  onOpenCreate,
  onOpenEdit,
  onOpenRestock,
  onOpenDelete
}) => {
  if (loading) {
    return <LoadingState message="Cargando catálogo e inventario..." color="indigo" />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No se encontraron productos"
        description="Prueba con otro término de búsqueda o agrega un nuevo producto al catálogo."
        actionText={isAdmin ? "+ Agregar Primer Producto" : undefined}
        onAction={isAdmin ? onOpenCreate : undefined}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Producto</th>
              <th className="py-4 px-4">Categoría</th>
              <th className="py-4 px-4 text-right">Precio COP</th>
              <th className="py-4 px-6 text-center">Stock Actual</th>
              <th className="py-4 px-4 text-center">Estado</th>
              <th className="py-4 px-6 text-right">Acciones de Almacén</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {products.map((p) => {
              const isOut = (p.stock || 0) <= 0;
              const isLow = (p.stock || 0) > 0 && (p.stock || 0) <= 5;

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    p.is_active === false ? 'opacity-50 bg-slate-50/40' : ''
                  }`}
                >
                  {/* Nombre y Miniatura */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                        {p.category?.toLowerCase().includes('bebida')
                          ? '🥤'
                          : p.category?.toLowerCase().includes('snack')
                          ? '🍫'
                          : p.category?.toLowerCase().includes('accesorio') || p.category?.toLowerCase().includes('protec')
                          ? '🥊'
                          : '💊'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{p.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                      {p.category || 'General'}
                    </span>
                  </td>

                  {/* Precio COP */}
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    ${(p.price || p.price_cop || 0).toLocaleString('es-CO')}
                  </td>

                  {/* Stock y Nivel */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5 ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span>{p.stock} unids</span>
                      </span>
                      {isOut ? (
                        <span className="text-[10px] font-bold text-rose-600">¡Agotado!</span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-600">Bajo Stock</span>
                      ) : null}
                    </div>
                  </td>

                  {/* Estado Activo / Inactivo */}
                  <td className="py-4 px-4 text-center">
                    {p.is_active === false ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        Inactivo
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Activo
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onOpenRestock(p)}
                          title="Reabastecer stock"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <HiPlus className="w-3.5 h-3.5" />
                          <span>+ Stock</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit(p)}
                          title="Editar producto"
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                        >
                          <HiPencilAlt className="w-4 h-4" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onOpenDelete(p)}
                          title="Eliminar o desactivar"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
