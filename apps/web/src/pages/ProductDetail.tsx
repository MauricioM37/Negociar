import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../types';
import { productService } from '../services/productService';
import { useCartStore } from '../store/useCartStore';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-4 h-4 ${
            index < fullStars || (index === fullStars && hasHalfStar)
              ? 'text-ml-yellow fill-current'
              : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-500 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setError('No pudimos identificar el producto solicitado.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await productService.obtenerPorId(id);

        if (cancelled) {
          return;
        }

        if (!data) {
          setProduct(null);
          setError('Producto no encontrado');
          return;
        }

        setProduct(data);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setProduct(null);
        setError(fetchError instanceof Error ? fetchError.message : 'No se pudo cargar el producto');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isOutOfStock = useMemo(() => (product?.stock ?? 0) <= 0, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-5/6" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-11 bg-gray-200 rounded w-full mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-xl shadow-card p-8 max-w-lg w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">No pudimos cargar este producto</h1>
          <p className="text-gray-500 mb-6">{error ?? 'Producto no disponible en este momento'}</p>
          <Link to="/catalog" className="btn-primary inline-block">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="mb-5">
          <Link to="/catalog" className="text-sm text-ml-blue hover:underline font-medium">
            ← Volver al catálogo
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-gray-100 p-6 md:p-8 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.title}
                className="w-full max-w-md aspect-square object-cover rounded-xl bg-white"
              />
            </div>

            <div className="p-6 md:p-8">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-ml-blue/10 text-ml-blue capitalize mb-4">
                {product.category}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>

              <div className="mt-3">{renderStars(product.rating)}</div>

              <p className="mt-4 text-3xl font-black text-ml-blue">{formatPrice(product.price)}</p>

              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <p className="text-gray-500">Categoría</p>
                    <p className="font-semibold text-gray-800 capitalize">{product.category}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <p className="text-gray-500">Stock</p>
                    <p className={`font-semibold ${isOutOfStock ? 'text-ml-red' : 'text-ml-green'}`}>
                      {isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addItem(product)}
                disabled={isOutOfStock}
                className="mt-8 w-full py-3 bg-[#001D3D] text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
