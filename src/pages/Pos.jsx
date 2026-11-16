import React, { useState, useEffect } from 'react';
import usePos from '../hooks/usePos';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { Link } from 'react-router-dom';
import {
  Modal,
  PageHeader,
  SearchFilterBar,
  EmptyState,
  LoadingState,
  ModalTicketPOS
} from '../components';
import {
  HiShoppingCart,
  HiPlus,
  HiMinus,
  HiTrash,
  HiCheckCircle,
  HiClock,
  HiUser,
  HiCreditCard,
  HiCash,
  HiArchive
} from 'react-icons/hi';

const Pos = () => {
  const {
    products,
    categories,
    sales,
    loading,
    fetchProducts,
    fetchCategories,
    processSale,
    fetchSales,
    addPOSProduct,
    addStock
  } = usePos();

  const { clients, fetchClients, isAdmin } = useAuth();
  const { mostrarAlerta } = useAlerta();

  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saleLoading, setSaleLoading] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState(null);

  // Admin New Product Modal
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Suplemento');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');

  // Quick Restock Modal (Admin)
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('10');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSales();
    fetchClients();
  }, [fetchProducts, fetchCategories, fetchSales, fetchClients]);

  // Filter products
  const filteredProducts = (products || []).filter((p) => {
    const matchesCat =
      selectedCategory === 'Todos' ||
      (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchesQ = !q || p.name?.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      mostrarAlerta(`"${product.name}" no tiene stock disponible.`, true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          mostrarAlerta(`Stock máximo alcanzado (${product.stock} unids).`, true);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            const prod = products.find((p) => p.id === productId);
            if (prod && newQty > prod.stock) {
              mostrarAlerta(`Stock máximo: ${prod.stock} unids.`, true);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClientId('');
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Sale
  const handleProcessSale = async () => {
    if (cart.length === 0) {
      mostrarAlerta('La orden de venta está vacía.', true);
      return;
    }

    setSaleLoading(true);
    try {
      const receipt = await processSale(
        cart,
        selectedClientId ? parseInt(selectedClientId) : null
      );

      setLastSaleReceipt({
        id: receipt?.id || Date.now(),
        items: [...cart],
        total: cartSubtotal,
        clienteNombre: clients.find((c) => c.id.toString() === selectedClientId)?.name || 'Cliente Mostrador',
        date: new Date().toLocaleString('es-CO')
      });

      clearCart();
    } catch (err) {
      console.error('Error al procesar venta POS:', err);
    } finally {
      setSaleLoading(false);
    }
  };

  // Create Product (Admin)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    try {
      await addPOSProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        price: parseFloat(newProdPrice),
        stock: parseInt(newProdStock || '0')
      });
      setNewProdName('');
      setNewProdPrice('');
      setNewProdStock('10');
      setIsNewProductModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header con PageHeader */}
      <PageHeader
        title="Punto de Venta (POS)"
        subtitle="Registro rápido de ventas de bebidas, suplementos y snacks para socios o visitantes de STRONG GYM."
        badge="Caja & Mostrador"
        badgeIcon={HiShoppingCart}
        badgeColor="emerald"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Link
                to="/productos"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <HiArchive className="w-4 h-4 text-emerald-300" />
                <span>Inventario</span>
              </Link>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <HiPlus className="w-4 h-4" />
                <span>+ Nuevo Artículo</span>
              </button>
            )}

            <div className="bg-white/10 backdrop-blur-xs p-1 rounded-xl border border-white/20 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pos'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Mostrador
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Historial ({sales?.length || 0})
              </button>
            </div>
          </div>
        }
      />

      {activeTab === 'pos' ? (
        /* ================= VISTA MOSTRADOR (GRID + TICKET) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Catálogo de Productos (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Buscador y Categorías con SearchFilterBar */}
            <SearchFilterBar
              categories={['Todos', ...(categories || [])]}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Buscar producto en caja..."
            />

            {/* Productos Grid */}
            {loading ? (
              <LoadingState message="Cargando inventario de caja..." color="emerald" />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon="🥤"
                title="No hay productos en esta sección"
                description="Crea productos con el botón de nuevo artículo o ajusta el filtro."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find((it) => it.id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all duration-150 select-none cursor-pointer group ${
                        isOutOfStock
                          ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                          : inCartItem
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {p.category || 'General'}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : p.stock < 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {isOutOfStock ? 'Agotado' : `${p.stock} disp.`}
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                title="Reabastecer stock (+10)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRestockItem(p);
                                  setRestockAmount('10');
                                }}
                                className="w-5 h-5 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 font-black text-[11px] flex items-center justify-center border border-slate-200 transition-colors"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {p.name}
                        </h4>
                      </div>

                      <div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-base font-black text-slate-900">
                            ${(p.price || 0).toLocaleString('es-CO')}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              inCartItem
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white'
                            }`}
                          >
                            <HiPlus className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Botón rápido si está agotado y es administrador */}
                        {isOutOfStock && isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRestockItem(p);
                              setRestockAmount('10');
                            }}
                            className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <HiPlus className="w-3.5 h-3.5" />
                            <span>Reabastecer (+10)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Orden Actual / Ticket de Venta (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HiShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Orden de Venta</h3>
                  <p className="text-[10px] text-slate-400">{cartTotalItems} artículos en caja</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Asignar Socio (Opcional) */}
            <div className="mt-3 mb-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Cliente / Socio (Opcional)
              </label>
              <div className="relative">
                <HiUser className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                >
                  <option value="">Cliente Ocasional (Mostrador)</option>
                  {(clients || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.full_name} ({c.document_id || 'Sin DNI'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <HiCash className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <HiCreditCard className="w-4 h-4" />
                  <span>Transferencia/Tarjeta</span>
                </button>
              </div>
            </div>

            {/* Lista del Carrito */}
            <div className="space-y-2 overflow-y-auto max-h-[36vh] pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-300">
                    <HiShoppingCart className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">No hay productos seleccionados</p>
                  <p className="text-[10px] text-slate-400">Haz clic en un producto para agregarlo</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        ${item.price?.toLocaleString('es-CO')} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1.5 text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[60px]">
                      <span className="text-xs font-black text-slate-900">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total y Botón Cobrar */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700">${cartSubtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-black text-slate-900">Total a Pagar</span>
                <span className="text-2xl font-black text-emerald-600">
                  ${cartSubtotal.toLocaleString('es-CO')}
                </span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || saleLoading}
                onClick={handleProcessSale}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saleLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <HiCheckCircle className="w-5 h-5" />
                    <span>Cobrar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VISTA HISTORIAL DE VENTAS ================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-lg font-black text-slate-900 mb-4">Historial de Ventas Registradas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID Venta</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cajero / Staff</th>
                  <th className="px-4 py-3">Artículos</th>
                  <th className="px-4 py-3 text-right">Total (COP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales && sales.length > 0 ? (
                  sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600">#{s.id}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(s.date).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900">{s.workerName}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {(s.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600">
                        ${(s.total || 0).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-xs text-slate-400">
                      No hay ventas registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Recibo / Ticket POS Modal Reutilizable */}
      <ModalTicketPOS
        isOpen={Boolean(lastSaleReceipt)}
        onClose={() => setLastSaleReceipt(null)}
        ventaData={lastSaleReceipt}
      />

      {/* 3. Modal: Nuevo Artículo POS (Utiliza Modal reutilizable) */}
      <Modal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        maxWidth="md"
        title="Nuevo Producto en Caja"
        subtitle="Agrega bebidas isotónicas, suplementos o snacks al inventario de punto de venta."
        badge="POS Strong Gym"
        badgeColor="emerald"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              placeholder="Ej. Bebida Isotónica 500ml"
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
            <select
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            >
              {(categories && categories.length > 0 ? categories : ['Suplemento', 'Bebida', 'Snack', 'Accesorio']).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio COP *</label>
              <input
                type="number"
                placeholder="5000"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Inicial *</label>
              <input
                type="number"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 cursor-pointer transition-all"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Modal: Reabastecimiento Rápido de Stock (Admin) */}
      <Modal
        isOpen={Boolean(restockItem)}
        onClose={() => setRestockItem(null)}
        size="sm"
        title="Reabastecer Producto"
        subtitle={restockItem ? `Ingresar unidades para "${restockItem.name}"` : ''}
        badge="POS Strong Gym"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const qty = parseInt(restockAmount);
            if (!qty || qty <= 0) return;
            await addStock(restockItem.id, qty);
            setRestockItem(null);
          }}
          className="space-y-4"
        >
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center text-slate-600 mb-1">
              <span>Stock actual en mostrador:</span>
              <strong className="text-slate-900 font-black">{restockItem?.stock || 0} unids</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>Nuevo stock estimado:</span>
              <strong className="font-black text-sm">
                {(restockItem?.stock || 0) + (parseInt(restockAmount) || 0)} unids
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Unidades a ingresar *
            </label>
            <input
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-900 text-base focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRestockAmount(num.toString())}
                className="py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                +{num}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRestockItem(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-colors cursor-pointer"
            >
              Confirmar +{restockAmount}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pos;
