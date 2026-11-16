import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Modal para Reabastecimiento Rápido de Stock en Almacén
 */
export const ModalRestockProduct = ({
  isOpen,
  onClose,
  product,
  onConfirmRestock
}) => {
  const [quantity, setQuantity] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('10');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return;

    setSubmitting(true);
    try {
      await onConfirmRestock(product.id, qty);
      onClose();
    } catch (err) {
      // Error manejado en context
    } finally {
      setSubmitting(false);
    }
  };

  const parsedQty = parseInt(quantity) || 0;
  const currentStock = product?.stock || 0;
  const estimatedStock = Math.max(0, currentStock + parsedQty);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Reabastecer Inventario"
      subtitle={product ? `Agregar unidades a "${product.name}"` : ''}
      badge="Entrada de Stock"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info de stock actual y proyectado */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex justify-between items-center text-slate-600 mb-1">
            <span>Stock actual:</span>
            <strong className="text-slate-900 font-black">{currentStock} unids</strong>
          </div>
          <div className="flex justify-between items-center text-emerald-700">
            <span>Nuevo stock estimado:</span>
            <strong className="font-black text-sm">{estimatedStock} unids</strong>
          </div>
        </div>

        {/* Input de cantidad */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Unidades a Ingresar *
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-emerald-600 text-center"
          />
        </div>

        {/* Botones de incremento rápido */}
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 24, 50].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setQuantity(num.toString())}
              className="py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              +{num}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Ingresando...' : 'Confirmar Entrada'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalRestockProduct;
