// apps/web/src/types/index.ts

/**
 * TIPO: Producto principal del marketplace
 * 
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
  ownerId?: number | null;
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
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
}

export type ProductSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductCatalogQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortOption;
  ownerId?: number;
}
