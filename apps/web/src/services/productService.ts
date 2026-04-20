// apps/web/src/services/productService.ts

import { mockProducts } from '../mocks/products';
import type { Product } from '../types';

/**
 * SERVICIO: ProductService - Gestiona operaciones con productos
 * 
 * ACTUAL: Usa datos mockeados locales con delay simulado
 * FUTURO: Cada método hará fetch a la API real
 */

// Simulamos latencia de red
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const productService = {
  /**
   * Obtener todos los productos
   * ACTUAL: Mock con delay
   * FUTURO: GET /api/products
   */
  getAll: async (): Promise<Product[]> => {
    console.log('[MOCK] productService.getAll() - Usando datos mock');
    await delay(500);
    return [...mockProducts];
  },

  /**
   * Obtener un producto por su ID
   * ACTUAL: Mock con búsqueda local
   * FUTURO: GET /api/products/:id
   */
  getById: async (id: string): Promise<Product | undefined> => {
    console.log(`[MOCK] productService.getById(${id}) - Buscando en mock`);
    await delay(300);
    return mockProducts.find(p => p.id === id);
  },

  /**
   * Obtener productos destacados (para Home)
   * ACTUAL: Primeros 4 productos
   * FUTURO: GET /api/products/featured
   */
  getFeatured: async (): Promise<Product[]> => {
    console.log('[MOCK] productService.getFeatured() - Usando primeros 4 productos');
    await delay(400);
    return mockProducts.slice(0, 4);
  },

  /**
   * Obtener productos por categoría
   * ACTUAL: Filtro local
   * FUTURO: GET /api/products?category=:category
   */
  getByCategory: async (category: string): Promise<Product[]> => {
    console.log(`[MOCK] productService.getByCategory(${category}) - Filtrando localmente`);
    await delay(400);
    
    if (category === 'all' || category === 'todas') {
      return [...mockProducts];
    }
    
    return mockProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  },

  /**
   * Búsqueda simple por texto
   * ACTUAL: Búsqueda local
   * FUTURO: GET /api/products/search?q=:query
   */
  search: async (query: string): Promise<Product[]> => {
    console.log(`[MOCK] productService.search("${query}") - Búsqueda local`);
    await delay(600);
    
    if (!query || query.trim() === '') {
      return [...mockProducts];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    return mockProducts.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  },
};