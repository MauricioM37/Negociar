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

export type ProductSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductQueryFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortOption;
  ownerId?: number;
}

export interface ProductMutationInput {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  ownerId: number;
}

export interface ProductUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  image?: string;
  ownerId: number;
}
