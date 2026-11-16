import React, { useState, useEffect, useRef } from 'react';
import useEcommerce from '../hooks/useEcommerce';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { uploadImageToCloudinary } from '../services/cloudinary';
import {
  Modal,
  ConfirmModal,
  PageHeader,
  SearchFilterBar,
  EmptyState,
  LoadingState,
  StatusBadge
} from '../components';
import {
  HiShoppingCart,
  HiEye,
  HiX,
  HiPlus,
  HiPencil,
  HiTrash,
  HiPhotograph,
  HiMinus,
  HiInformationCircle
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const CATEGORIES = ['Todos', 'Ropa Hombre', 'Ropa Mujer', 'Accesorios', 'Suplementos'];
const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600';
const DEFAULT_WHATSAPP_NUMBER = '573001234567';

const Tienda = () => {
  const { isAdmin } = useAuth();
  const { mostrarAlerta } = useAlerta();
  const {
    products,
    loading,
    cart,
    fetchEcommerceProducts,
    addStoreProduct,
    updateStoreProduct,
    deleteStoreProduct,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
  } = useEcommerce();

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Modal de confirmación para eliminar
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null, productName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulario de Producto
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ropa Hombre',
    price: '',
    sizes: 'S, M, L, XL',
    whatsapp_number: '',
    description: '',
    image: '',
    is_published: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const filters = isAdmin ? {} : { published: true };
    fetchEcommerceProducts(filters);
  }, [fetchEcommerceProducts, isAdmin]);

  useEffect(() => {
    if (selectedProduct) {
      const sizesArray = parseSizes(selectedProduct.sizes || selectedProduct.available_sizes);
      setSelectedSize(sizesArray.length > 0 ? sizesArray[0] : '');
    }
  }, [selectedProduct]);

  const parseSizes = (sizesString) => {
    if (!sizesString) return [];
    return sizesString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const filteredProducts = (products || []).filter((p) => {
    const pCat = (p.category || '').toLowerCase();
    const matchesCat =
      selectedCategory === 'Todos' ||
      pCat === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Suplementos' &&
        (pCat.includes('suplemento') ||
          pCat.includes('proteina') ||
          pCat.includes('creatina') ||
          pCat.includes('accesorio')));

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      pCat.includes(q);

    return matchesCat && matchesSearch;
  });

  // --- WhatsApp Handlers ---
  const handleOrderSingleWhatsApp = (product, size = '') => {
    const phone = product.whatsapp_number || DEFAULT_WHATSAPP_NUMBER;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
    const sizeText = size ? `(Talla: *${size}*)` : '';

    const message = `Hola STRONG GYM 👋, estoy interesado/a en la prenda/producto: *${product.name}* ${sizeText} (Precio: $${priceNum.toLocaleString('es-CO')} COP). ¿Tienen disponibilidad en stock?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendCartWhatsApp = () => {
    if (cart.length === 0) return;
    const phone = cart[0]?.whatsapp_number || DEFAULT_WHATSAPP_NUMBER;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const itemsSummary = cart
      .map((item, idx) => {
        const sizeText = item.selectedSize ? ` - Talla: ${item.selectedSize}` : '';
        const subtotal = item.price * item.quantity;
        return `${idx + 1}. *${item.name}* (x${item.quantity}${sizeText}) ➔ $${subtotal.toLocaleString('es-CO')} COP`;
      })
      .join('\n');

    const message =
      `Hola STRONG GYM 👋, quisiera consultar y solicitar los siguientes productos de la tienda virtual:\n\n` +
      `${itemsSummary}\n\n` +
      `💰 *Total Estimado: $${total.toLocaleString('es-CO')} COP*\n\n` +
      `¿Tienen disponibilidad para coordinar la entrega o recoger en recepción? ¡Muchas gracias!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- CRUD Handlers ---
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Ropa Hombre',
      price: '',
      sizes: 'S, M, L, XL',
      whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
      description: '',
      image: '',
      is_published: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Ropa Hombre',
      price: product.price || '',
      sizes: product.sizes || product.available_sizes || 'Unitalla',
      whatsapp_number: product.whatsapp_number || DEFAULT_WHATSAPP_NUMBER,
      description: product.description || '',
      image: product.image || product.image_url || '',
      is_published: product.is_published !== false
    });
    setIsProductModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarAlerta('Por favor selecciona un archivo de imagen válido', true);
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file, 'ecommerce');
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        mostrarAlerta('Fotografía subida a Cloudinary exitosamente', false);
      }
    } catch (err) {
      mostrarAlerta(err.message || 'Error al subir la imagen a Cloudinary', true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.sizes.trim()) {
      mostrarAlerta('Nombre, precio y tallas son obligatorios', true);
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        sizes: formData.sizes.trim(),
        whatsapp_number: formData.whatsapp_number.trim() || DEFAULT_WHATSAPP_NUMBER,
        description: formData.description.trim(),
        image: formData.image || DEFAULT_PRODUCT_IMG,
        is_published: Boolean(formData.is_published)
      };

      if (editingProduct) {
        await updateStoreProduct(editingProduct.id, payload);
      } else {
        await addStoreProduct(payload);
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      // Manejado en context
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm.productId) return;
    setIsDeleting(true);
    try {
      await deleteStoreProduct(deleteConfirm.productId);
      if (selectedProduct?.id === deleteConfirm.productId) {
        setSelectedProduct(null);
      }
      setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-8">
      {/* 1. Header con componente reutilizable PageHeader */}
      <PageHeader
        title="Tienda STRONG GYM"
        subtitle="Explora la colección oficial de ropa deportiva, accesorios y suplementación. Selecciona tu talla y contacta directamente al WhatsApp del gimnasio."
        badge="Tienda Oficial & Pedidos WhatsApp"
        badgeIcon={FaWhatsapp}
        badgeColor="emerald"
        actions={
          <>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <HiPlus className="w-4 h-4" />
                <span>Publicar Producto</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 relative cursor-pointer"
            >
              <HiShoppingCart className="w-4 h-4" />
              <span>Bolsa WhatsApp</span>
              {cartItemsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[11px] font-black animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </>
        }
      />

      {/* 2. Barra de Filtro y Buscador reutilizable */}
      <SearchFilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar camiseta, short, shaker, proteína..."
      />

      {/* 3. Grid de Productos o Estados de Carga / Vacío */}
      {loading ? (
        <LoadingState message="Cargando catálogo oficial..." color="emerald" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No encontramos productos en esta sección"
          description="Intenta cambiar de categoría o buscar con otra palabra clave."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const price = typeof p.price === 'number' ? p.price : parseFloat(p.price || 0);
            const img = p.image || p.image_url || DEFAULT_PRODUCT_IMG;
            const sizesList = parseSizes(p.sizes || p.available_sizes);

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Contenedor de Imagen */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white/95 backdrop-blur-xs text-slate-900 shadow-sm border border-slate-100">
                        {p.category || 'General'}
                      </span>
                      {p.is_published === false && (
                        <StatusBadge status="DRAFT" size="xs" />
                      )}
                    </div>

                    {/* Acciones flotantes */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 rounded-xl bg-white/90 text-slate-700 hover:text-indigo-600 hover:bg-white shadow-md transition-all cursor-pointer"
                          title="Editar producto"
                        >
                          <HiPencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              productId: p.id,
                              productName: p.name
                            })
                          }
                          className="p-2 rounded-xl bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white shadow-md transition-all cursor-pointer"
                          title="Eliminar producto"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className="p-2 rounded-xl bg-white/90 text-slate-700 hover:text-emerald-600 hover:bg-white shadow-md transition-all cursor-pointer"
                        title="Ver detalles"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo de la Card */}
                  <div className="p-5">
                    <h3
                      onClick={() => setSelectedProduct(p)}
                      className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description || 'Prenda/Producto oficial STRONG GYM.'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Tallas:</span>
                      {sizesList.length > 0 ? (
                        sizesList.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500">Unitalla</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer de la Card */}
                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Precio</p>
                      <p className="text-lg font-black text-slate-900">
                        ${price.toLocaleString('es-CO')}{' '}
                        <span className="text-[10px] font-normal text-slate-400">COP</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addToCart(p, sizesList[0] || 'Unitalla')}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Agregar a la bolsa de consulta"
                      >
                        <HiShoppingCart className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOrderSingleWhatsApp(p, sizesList[0] || '')}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal Detalle de Producto (Utiliza el componente unificado Modal) */}
      <Modal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        maxWidth="xl"
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square">
              <img
                src={selectedProduct.image || selectedProduct.image_url || DEFAULT_PRODUCT_IMG}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {selectedProduct.category || 'General'}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-2 leading-snug">
                  {selectedProduct.name}
                </h3>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  ${(typeof selectedProduct.price === 'number'
                    ? selectedProduct.price
                    : parseFloat(selectedProduct.price || 0)
                  ).toLocaleString('es-CO')}{' '}
                  <span className="text-xs font-bold text-slate-400">COP</span>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedProduct.description ||
                  'Prenda confeccionada para entrenamiento exigente y estilo casual. Consulta stock de tallas con nosotros.'}
              </p>

              {parseSizes(selectedProduct.sizes || selectedProduct.available_sizes).length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                    Selecciona tu talla:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {parseSizes(selectedProduct.sizes || selectedProduct.available_sizes).map((s) => {
                      const isChosen = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const prod = selectedProduct;
                    const size = selectedSize;
                    setSelectedProduct(null);
                    handleOrderSingleWhatsApp(prod, size);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Preguntar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedProduct, selectedSize || 'Unitalla');
                    setSelectedProduct(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <HiShoppingCart className="w-4 h-4 text-slate-500" />
                  <span>Agregar a la Bolsa WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Modal de Carrito WhatsApp (Utiliza el componente unificado Modal) */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        maxWidth="md"
        title="Bolsa de Pedidos WhatsApp"
        subtitle="Consulta disponibilidad y método de pago directamente con recepción"
        badge="Catálogo STRONG GYM"
        badgeColor="emerald"
        footer={
          cart.length > 0 && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Vaciar
              </button>
              <button
                type="button"
                onClick={handleSendCartWhatsApp}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Enviar Pedido a WhatsApp</span>
              </button>
            </div>
          )
        }
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-xl">
                🛍️
              </div>
              <p className="text-xs font-bold text-slate-600">Tu bolsa está vacía</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Agrega prendas o suplementos para consultar en conjunto.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                >
                  <img
                    src={item.image || DEFAULT_PRODUCT_IMG}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {item.selectedSize && <span>Talla: {item.selectedSize}</span>}
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(idx, -1)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded"
                    >
                      <HiMinus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 px-1">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(idx, 1)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded"
                    >
                      <HiPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Eliminar de la lista"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Total Estimado</span>
                <span className="text-lg font-black text-slate-900">
                  ${cartTotalPrice.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <HiInformationCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  No procesamos cobros en línea. Este botón abrirá WhatsApp con el pedido listo para que recepción confirme stock y coordine el pago contigo.
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 6. Modal de Crear / Editar Producto (Utiliza el componente unificado Modal) */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        maxWidth="lg"
        title={editingProduct ? 'Editar Producto de Tienda' : 'Publicar Nuevo Producto'}
        subtitle="Los clientes verán este artículo en el showroom y podrán pedirlo por WhatsApp."
        badge={editingProduct ? 'Modificar' : 'Catálogo E-commerce'}
        badgeColor="indigo"
      >
        <form onSubmit={handleSaveProductSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Producto / Prenda *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Camiseta Oversize Negra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              >
                <option value="Ropa Hombre">Ropa Hombre</option>
                <option value="Ropa Mujer">Ropa Mujer</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Suplementos">Suplementos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Precio (COP $) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Ej: 65000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tallas Disponibles *
              </label>
              <input
                type="text"
                required
                placeholder="S, M, L, XL ó Unitalla"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Separadas por comas</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                WhatsApp para Pedidos
              </label>
              <input
                type="text"
                placeholder="573001234567"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Fotografía del Producto
            </label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                <HiPhotograph className="w-4 h-4 text-slate-600" />
                <span>{uploadingImage ? 'Subiendo a Cloudinary...' : 'Subir Imagen'}</span>
              </button>

              <input
                type="url"
                placeholder="O pega una URL de imagen..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>

            {formData.image && (
              <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows="3"
              placeholder="Detalles sobre tela, fit, composición o modo de uso..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="is_published" className="text-xs font-bold text-slate-700 cursor-pointer">
              Publicar de inmediato en la tienda virtual
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingProduct || uploadingImage}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {savingProduct ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Publicar Producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Modal de Confirmación Universal (ConfirmModal) */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: '' })}
        onConfirm={handleDeleteConfirmed}
        title="¿Eliminar producto?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${deleteConfirm.productName}" del catálogo de la tienda?`}
        confirmText="Eliminar"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Tienda;
