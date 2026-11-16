import React, { createContext, useState, useCallback } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const EcommerceContext = createContext();

export const EcommerceProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]); // Bolsa de consulta de productos para WhatsApp
  const { mostrarAlerta } = useAlerta();

  const fetchEcommerceProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/ecommerce/products', {
        params: { ...filters }
      });
      const categoryLabelMap = {
        MEN_CLOTHING: 'Ropa Hombre',
        WOMEN_CLOTHING: 'Ropa Mujer',
        ACCESSORIES: 'Accesorios',
      };

      if (res.success && res.data) {
        const rawList = Array.isArray(res.data) 
          ? res.data 
          : (res.data.rows || res.data.products || []);

        const normalized = rawList.map(p => {
          let coverImg = null;
          if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            const coverObj = p.images.find(img => img.is_cover) || p.images[0];
            coverImg = coverObj.image_url || coverObj.url;
          }
          if (!coverImg) {
            coverImg = p.image_url || p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
          }

          return {
            ...p,
            name: p.name || 'Producto',
            category: categoryLabelMap[p.category] || p.category || 'General',
            categoryRaw: p.category,
            price: parseFloat(p.price_cop ?? p.price ?? 0),
            image: coverImg,
            sizes: p.available_sizes || p.sizes || 'Unitalla',
            whatsapp_number: p.whatsapp_number,
            is_published: p.is_published !== false
          };
        });
        setProducts(normalized);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de tienda:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStoreProduct = async (productData) => {
    try {
      const categoryMap = {
        'Ropa Hombre': 'MEN_CLOTHING',
        'Ropa Mujer': 'WOMEN_CLOTHING',
        'Accesorios': 'ACCESSORIES',
        'Suplementos': 'ACCESSORIES'
      };
      const cat = categoryMap[productData.category] || productData.category?.toUpperCase() || 'ACCESSORIES';

      const payload = {
        name: productData.name,
        category: cat,
        description: productData.description || '',
        price_cop: parseFloat(productData.price),
        available_sizes: productData.sizes || productData.available_sizes || 'Unitalla',
        image_url: productData.image || productData.image_url,
        whatsapp_number: productData.whatsapp_number || null,
        is_published: productData.is_published !== undefined ? productData.is_published : true
      };

      const { data: res } = await clienteAxios.post('/ecommerce/products', payload);
      if (res.success) {
        mostrarAlerta('Producto publicado en la tienda virtual', false);
        await fetchEcommerceProducts();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || 'Error al agregar producto a la tienda';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const updateStoreProduct = async (id, productData) => {
    try {
      const categoryMap = {
        'Ropa Hombre': 'MEN_CLOTHING',
        'Ropa Mujer': 'WOMEN_CLOTHING',
        'Accesorios': 'ACCESSORIES',
        'Suplementos': 'ACCESSORIES'
      };
      const cat = categoryMap[productData.category] || productData.category?.toUpperCase() || productData.category;

      const payload = {
        name: productData.name,
        category: cat,
        description: productData.description,
        price_cop: productData.price !== undefined ? parseFloat(productData.price) : undefined,
        available_sizes: productData.sizes || productData.available_sizes,
        image_url: productData.image || productData.image_url,
        whatsapp_number: productData.whatsapp_number !== undefined ? productData.whatsapp_number : null,
        is_published: productData.is_published
      };

      const { data: res } = await clienteAxios.put(`/ecommerce/products/${id}`, payload);
      if (res.success) {
        mostrarAlerta('Producto actualizado correctamente', false);
        await fetchEcommerceProducts();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || 'Error al actualizar producto';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const deleteStoreProduct = async (id) => {
    try {
      const { data: res } = await clienteAxios.delete(`/ecommerce/products/${id}`);
      if (res.success) {
        mostrarAlerta('Producto eliminado de la tienda virtual', false);
        setProducts(prev => prev.filter(p => p.id !== id));
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || 'Error al eliminar producto';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const getProductDetails = async (id) => {
    try {
      const { data: res } = await clienteAxios.get(`/ecommerce/products/${id}`);
      if (res.success) {
        setSelectedProduct(res.data);
        return res.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Carrito / Bolsa de consulta para WhatsApp
  const addToCart = (product, selectedSize = '') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, selectedSize, quantity: 1 }];
    });
    mostrarAlerta(`"${product.name}" agregado a tu lista de WhatsApp`, false);
  };

  const updateCartQuantity = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <EcommerceContext.Provider
      value={{
        products,
        selectedProduct,
        loading,
        cart,
        fetchEcommerceProducts,
        addStoreProduct,
        updateStoreProduct,
        deleteStoreProduct,
        getProductDetails,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </EcommerceContext.Provider>
  );
};
