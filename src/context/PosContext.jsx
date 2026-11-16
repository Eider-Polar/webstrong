import React, { createContext, useState, useCallback, useEffect } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const PosContext = createContext();

export const PosProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Suplemento', 'Bebida', 'Snack']);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mostrarAlerta } = useAlerta();

  const fetchCategories = useCallback(async () => {
    try {
      const { data: res } = await clienteAxios.get('/pos/categories');
      if (res.success && Array.isArray(res.data)) {
        const names = res.data.map(c => c.name);
        if (names.length > 0) {
          setCategories(names);
        }
      }
    } catch (err) {
      console.error('Error al cargar categorías POS:', err);
    }
  }, []);

  const createCategory = async (categoryName) => {
    try {
      const name = (categoryName || '').trim();
      if (!name) return null;
      const { data: res } = await clienteAxios.post('/pos/categories', { name });
      if (res.success) {
        mostrarAlerta(`Categoría "${name}" creada exitosamente`, false);
        await fetchCategories();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear categoría';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const fetchProducts = useCallback(async (category = null, search = '', onlyActive = false) => {
    setLoading(true);
    try {
      let query = `?onlyActive=${onlyActive}`;
      if (category && category !== 'Todos') query += `&category=${encodeURIComponent(category)}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const { data: res } = await clienteAxios.get(`/pos/products${query}`);
      if (res.success) {
        const normalized = (res.data || []).map(p => ({
          ...p,
          price: parseFloat(p.price_cop || 0)
        }));
        setProducts(normalized);
      }
    } catch (err) {
      console.error('Error al cargar productos POS:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPOSProduct = async (productData) => {
    try {
      const cat = (productData.category || 'General').trim();
      const payload = {
        name: productData.name.trim(),
        category: cat,
        price_cop: parseFloat(productData.price ?? productData.price_cop),
        stock: parseInt(productData.stock || 0),
        is_active: productData.is_active !== undefined ? productData.is_active : true
      };

      const { data: res } = await clienteAxios.post('/pos/products', payload);
      if (res.success) {
        mostrarAlerta('Producto registrado exitosamente en el inventario', false);
        await fetchProducts();
        await fetchCategories();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al agregar producto';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const payload = {};
      if (productData.name) payload.name = productData.name.trim();
      if (productData.category) payload.category = productData.category.trim();
      if (productData.price !== undefined || productData.price_cop !== undefined) {
        payload.price_cop = parseFloat(productData.price ?? productData.price_cop);
      }
      if (productData.stock !== undefined) {
        payload.stock = parseInt(productData.stock);
      }
      if (productData.is_active !== undefined) {
        payload.is_active = Boolean(productData.is_active);
      }

      const { data: res } = await clienteAxios.put(`/pos/products/${id}`, payload);
      if (res.success) {
        mostrarAlerta('Producto actualizado correctamente', false);
        await fetchProducts();
        await fetchCategories();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar producto';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { data: res } = await clienteAxios.delete(`/pos/products/${id}`);
      if (res.success) {
        mostrarAlerta(res.data?.message || 'Producto eliminado correctamente', false);
        await fetchProducts();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar producto';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const addStock = async (productId, amount) => {
    try {
      const current = products.find(p => p.id === productId);
      const newStock = Math.max(0, (current ? current.stock : 0) + parseInt(amount));

      const { data: res } = await clienteAxios.put(`/pos/products/${productId}`, {
        stock: newStock
      });

      if (res.success) {
        mostrarAlerta(`Stock actualizado (+${amount} unids, total: ${newStock})`, false);
        await fetchProducts();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar stock';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const setDirectStock = async (productId, exactStock) => {
    try {
      const stockVal = Math.max(0, parseInt(exactStock));
      const { data: res } = await clienteAxios.put(`/pos/products/${productId}`, {
        stock: stockVal
      });

      if (res.success) {
        mostrarAlerta(`Stock ajustado a ${stockVal} unidades`, false);
        await fetchProducts();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al ajustar stock';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const processSale = async (cartItems, clientId = null) => {
    try {
      const payload = {
        client_id: clientId,
        payment_method: 'CASH',
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const { data: res } = await clienteAxios.post('/pos/sales', payload);
      if (res.success) {
        mostrarAlerta('Venta procesada y stock descontado', false);
        await fetchProducts();
        await fetchSales();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al procesar la venta';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const fetchSales = useCallback(async () => {
    try {
      const { data: res } = await clienteAxios.get('/pos/sales');
      if (res.success && res.data) {
        const normalized = (res.data.rows || []).map(s => ({
          id: s.id.toString(),
          workerName: s.worker ? s.worker.full_name : 'Cajero',
          total: parseFloat(s.total_cop),
          items: (s.items || []).map(it => ({
            name: it.product ? it.product.name : 'Artículo',
            quantity: it.quantity
          })),
          date: s.sale_datetime
        }));
        setSales(normalized);
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <PosContext.Provider
      value={{
        products,
        categories,
        sales,
        loading,
        fetchProducts,
        fetchCategories,
        createCategory,
        addPOSProduct,
        updateProduct,
        deleteProduct,
        addStock,
        setDirectStock,
        processSale,
        fetchSales
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export default PosContext;
