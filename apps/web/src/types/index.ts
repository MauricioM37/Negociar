// apps/web/src/types/index.ts

/**
 * TIPO: Producto principal del marketplace
 * 
 * ACTUAL: Mockeado desde src/mock/products.ts
 * FUTURO: Vendrá de la API REST (GET /api/products)
 */
export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  seller: string;
  rating: number;
}

/**
 * TIPO: Item dentro del carrito de compras
 */
export interface CartItem extends Product {
  quantity: number;
}

/**
 * TIPO: Filtros para búsqueda avanzada
 */
export interface SearchFilters {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating';
}