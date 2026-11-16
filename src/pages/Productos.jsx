import React, { useState, useEffect, useMemo } from 'react';
import usePos from '../hooks/usePos';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  SearchFilterBar,
  ConfirmModal,
  InventoryStatsCards,
  InventoryTable,
  ModalProductForm,
  ModalRestockProduct
} from '../components';
import { HiArchive, HiShoppingCart, HiPlus } from 'react-icons/hi';

const Productos = () => {
  const {
    products,
    categories,
    loading,
    fetchProducts,
    fetchCategories,
    addPOSProduct,
    updateProduct,
    deleteProduct,
    addStock
  } = usePos();

  const { isAdmin } = useAuth();
  const { mostrarAlerta } = useAlerta();

  // Estados de Filtro y Búsqueda
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Crear, objeto = Editar
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    fetchProducts(null, '', false);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Guardar Alta o Edición de Producto
  const handleSaveProduct = async (productData) => {
    if (productData.id) {
      await updateProduct(productData.id, productData);
    } else {
      await addPOSProduct(productData);
    }
  };

  // Reabastecer Stock
  const handleConfirmRestock = async (productId, amount) => {
    await addStock(productId, amount);
  };

  // Eliminar / Desactivar Producto
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeletingProduct(true);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    } catch (err) {
      // Error notificado en context
    } finally {
      setDeletingProduct(false);
    }
  };

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const matchesCat =
        selectedCategory === 'Todos' ||
        (p.category || '').toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);

      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= 5;
      if (stockFilter === 'out') matchesStock = p.stock <= 0;
      if (stockFilter === 'active') matchesStock = p.is_active !== false;
      if (stockFilter === 'inactive') matchesStock = p.is_active === false;

      return matchesCat && matchesSearch && matchesStock;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  // Métricas agregadas de inventario
  const stats = useMemo(() => {
    const list = products || [];
    return {
      totalItems: list.length,
      totalUnits: list.reduce((acc, p) => acc + (p.stock || 0), 0),
      totalValue: list.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0),
      lowStockCount: list.filter((p) => p.stock > 0 && p.stock <= 5).length,
      outOfStockCount: list.filter((p) => p.stock <= 0).length
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* 1. Header con PageHeader */}
      <PageHeader
        title="Inventario y Control de Stock"
        subtitle="Administra los productos del mostrador POS: reabastece existencias, ajusta precios y cataloga nuevos artículos."
        badge="Gestión de Almacén"
        badgeIcon={HiArchive}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/pos"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <HiShoppingCart className="w-4 h-4 text-slate-500" />
              <span>Ir a Caja (POS)</span>
            </Link>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <HiPlus className="w-4 h-4" />
                <span>+ Nuevo Producto</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Tarjetas de Resumen KPI */}
      <InventoryStatsCards
        stats={stats}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
      />

      {/* 3. Filtros y Búsqueda */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <SearchFilterBar
          categories={['Todos', ...(categories || [])]}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Buscar por nombre de producto o categoría..."
        />

        {/* Pestañas de Estado de Stock */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase mr-1">Filtro Rápido:</span>
          {[
            { id: 'all', label: `Todos (${products?.length || 0})` },
            { id: 'low', label: `Bajo Stock (${stats.lowStockCount})`, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'out', label: `Agotados (${stats.outOfStockCount})`, color: 'text-rose-700 bg-rose-50 border-rose-200' },
            { id: 'active', label: 'Solo Activos' },
            { id: 'inactive', label: 'Inactivos' }
          ].map((tab) => {
            const isActive = stockFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStockFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : tab.color || 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tabla de Inventario */}
      <InventoryTable
        products={filteredProducts}
        loading={loading}
        isAdmin={isAdmin}
        onOpenCreate={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenEdit={(product) => {
          setEditingProduct(product);
          setIsProductModalOpen(true);
        }}
        onOpenRestock={(product) => {
          setRestockProduct(product);
          setIsRestockModalOpen(true);
        }}
        onOpenDelete={(product) => setProductToDelete(product)}
      />

      {/* 5. Modal: Crear / Editar Producto */}
      <ModalProductForm
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        onSaveProduct={handleSaveProduct}
      />

      {/* 6. Modal: Reabastecimiento Rápido */}
      <ModalRestockProduct
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockProduct(null);
        }}
        product={restockProduct}
        onConfirmRestock={handleConfirmRestock}
      />

      {/* 7. Modal de Confirmación: Eliminar / Desactivar Producto */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto del inventario?"
        message={
          productToDelete
            ? `¿Estás seguro de que deseas eliminar o desactivar "${productToDelete.name}"? Si el producto tiene ventas históricas registradas, se desactivará automáticamente para preservar los reportes contables.`
            : ''
        }
        confirmText={deletingProduct ? 'Eliminando...' : 'Sí, eliminar'}
        cancelText="Conservar"
        type="danger"
      />
    </div>
  );
};

export default Productos;
