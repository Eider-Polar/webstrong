import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Modal para Crear o Editar un Producto de Almacén/POS
 */
export const ModalProductForm = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSaveProduct
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Suplemento');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setCategory(editingProduct.category || 'Suplemento');
      setCustomCategory('');
      setPrice(editingProduct.price ?? editingProduct.price_cop ?? '');
      setStock(editingProduct.stock !== undefined ? editingProduct.stock.toString() : '0');
      setIsActive(editingProduct.is_active !== false);
    } else {
      setName('');
      setCategory(categories && categories.length > 0 ? categories[0] : 'Suplemento');
      setCustomCategory('');
      setPrice('');
      setStock('10');
      setIsActive(true);
    }
  }, [editingProduct, categories, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = (category === '__NEW__' ? customCategory : category).trim();

    setSubmitting(true);
    try {
      await onSaveProduct({
        id: editingProduct?.id,
        name: name.trim(),
        category: finalCategory,
        price: parseFloat(price),
        stock: parseInt(stock),
        is_active: isActive
      });
      onClose();
    } catch (err) {
      // Error manejado en context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={editingProduct ? 'Editar Producto' : 'Nuevo Producto en Inventario'}
      subtitle={
        editingProduct
          ? `Modifica los detalles, precio o existencias de "${editingProduct.name}".`
          : 'Registra un nuevo artículo para la venta en el mostrador POS.'
      }
      badge={editingProduct ? 'Edición Almacén' : 'Alta de Producto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            placeholder="Ej. Bebida Isotónica Blue Cool 500ml"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Categoría *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
          >
            {(categories || []).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__NEW__">+ Crear Nueva Categoría...</option>
          </select>

          {category === '__NEW__' && (
            <input
              type="text"
              placeholder="Escribe el nombre de la nueva categoría"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:outline-none focus:bg-white"
            />
          )}
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Precio de Venta COP *
            </label>
            <input
              type="number"
              placeholder="4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="100"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {editingProduct ? 'Stock Actual *' : 'Stock Inicial *'}
            </label>
            <input
              type="number"
              placeholder="10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Switch Habilitar Venta */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Producto Habilitado para Venta</p>
            <p className="text-[11px] text-slate-400">Si está inactivo, no aparecerá en el mostrador POS.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalProductForm;
