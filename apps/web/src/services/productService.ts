import type { Product, ProductCatalogQuery } from '../types';

const API_BASE_URL = 'http://localhost:3001/api/products';
const API_ORIGIN = 'http://localhost:3001';
const AUTH_STORAGE_KEY = 'my-turbo-auth';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
};

const normalizeImage = (image: string): string => {
  if (!image) {
    return image;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return `${API_ORIGIN}${image.startsWith('/') ? image : `/${image}`}`;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: normalizeImage(product.image),
});

const buildQueryString = (query?: ProductCatalogQuery): string => {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (typeof query.minPrice === 'number') params.set('minPrice', String(query.minPrice));
  if (typeof query.maxPrice === 'number') params.set('maxPrice', String(query.maxPrice));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (typeof query.ownerId === 'number') params.set('ownerId', String(query.ownerId));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const request = async <T>(path = '', query?: ProductCatalogQuery): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const requestWithAuth = async <T>(path: string, options: RequestInit): Promise<T> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Necesitás iniciar sesión para administrar productos');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    let message = fallback;

    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      // ignore JSON parsing failures and keep fallback message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const productService = {
  obtenerTodos: async (consulta?: ProductCatalogQuery): Promise<Product[]> => {
    const productos = await request<Product[]>('', consulta);
    return productos.map(normalizeProduct);
  },

  obtenerPorId: async (id: string): Promise<Product | undefined> => {
    try {
      const producto = await request<Product>(`/${id}`);
      return normalizeProduct(producto);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }

      throw error;
    }
  },

  obtenerDestacados: async (): Promise<Product[]> => {
    const productos = await request<Product[]>('/featured');
    return productos.map(normalizeProduct);
  },

  obtenerPorCategoria: async (categoria: string): Promise<Product[]> => {
    if (categoria === 'all' || categoria === 'todas') {
      const productos = await request<Product[]>('');
      return productos.map(normalizeProduct);
    }

    const productos = await request<Product[]>('', { category: categoria });
    return productos.map(normalizeProduct);
  },

  buscar: async (consulta: string): Promise<Product[]> => {
    if (!consulta || consulta.trim() === '') {
      const productos = await request<Product[]>('');
      return productos.map(normalizeProduct);
    }

    const productos = await request<Product[]>('', { search: consulta.trim() });
    return productos.map(normalizeProduct);
  },

  obtenerMisProductos: async (idPropietario: number): Promise<Product[]> => {
    const productos = await request<Product[]>('', { ownerId: idPropietario, sortBy: 'relevance' });
    return productos.map(normalizeProduct);
  },

  registrarProducto: async (entrada: FormData): Promise<Product> => {
    const producto = await requestWithAuth<Product>('', {
      method: 'POST',
      body: entrada,
    });

    return normalizeProduct(producto);
  },

  actualizarProducto: async (id: string, entrada: FormData): Promise<Product> => {
    const producto = await requestWithAuth<Product>(`/${id}`, {
      method: 'PUT',
      body: entrada,
    });

    return normalizeProduct(producto);
  },

  eliminarProducto: async (id: string): Promise<void> => {
    await requestWithAuth<void>(`/${id}`, {
      method: 'DELETE',
    });
  },
};
