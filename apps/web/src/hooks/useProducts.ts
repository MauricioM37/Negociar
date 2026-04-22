// apps/web/src/hooks/useProducts.ts

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import type { Product, ProductCatalogQuery } from '../types';


export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ useCallback estabiliza la función para que pueda usarse en efectos
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeatured();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos destacados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // Array vacío porque no depende de nada externo

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Dependencia estable gracias a useCallback

  return { products, loading, error, refetch: fetchProducts };
};

/**
 * Custom hook para obtener productos por categoría
 */
export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!category) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getByCategory(category);
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

/**
 * Custom hook para búsqueda de productos con debounce
 */
export const useSearchProducts = (searchQuery: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setProducts([]);
      return;
    }

    let isMounted = true;

    const searchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.search(searchQuery);
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Error en la búsqueda');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce para evitar búsquedas en cada tecla
    const timeoutId = setTimeout(searchProducts, 300);

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [searchQuery]);

  return { products, loading, error };
};

export const useCatalogProducts = (query: ProductCatalogQuery) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll(query);
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos del catálogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.search, query.category, query.minPrice, query.maxPrice, query.sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
