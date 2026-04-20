import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { mockProducts, categories } from '../mocks/products';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [initialSearch, initialCategory, sortBy]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (initialSearch) {
      const search = initialSearch.toLowerCase();
      products = products.filter(
        p =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.seller.toLowerCase().includes(search)
      );
    }

    if (selectedCategory) {
      const categoryMap: Record<string, string> = {
        electronica: 'electrónica',
        hogar: 'hogar',
        moda: 'moda',
        libros: 'libros',
        deportes: 'deportes',
        vehiculos: 'vehículos',
        juegos: 'juegos',
        belleza: 'belleza',
      };
      const catLower = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
      products = products.filter(p => p.category.toLowerCase().includes(catLower));
    }

    products = products.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return products;
  }, [initialSearch, selectedCategory, priceRange, sortBy]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    if (categoryId === selectedCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 1500000]);
    setSortBy('relevance');
    searchParams.delete('search');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {initialSearch 
                  ? `Resultados para "${initialSearch}"` 
                  : selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name || 'Catálogo'
                    : 'Todos los productos'
                }
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} productos encontrados
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-ml-blue"
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="rating">Mejor valoración</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside 
            className={`fixed lg:static inset-0 z-40 lg:z-auto w-80 lg:w-64 flex-shrink-0 bg-white lg:bg-transparent transition-all duration-300 ${
              showFilters 
                ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } lg:block`}
          >
            <div className="h-full lg:h-auto overflow-y-auto p-6 lg:p-0">
              {showFilters && (
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden absolute top-4 right-4 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-ml-blue hover:underline"
                >
                  Limpiar todo
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-ml-blue text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </span>
                      <span className="text-xs opacity-70">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Rango de precio</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      placeholder="Mín"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      placeholder="Máx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => setPriceRange([0, 50000])}
                    className={`w-full px-3 py-1.5 text-sm rounded border ${
                      priceRange[1] === 50000 ? 'border-ml-blue bg-ml-blue/10 text-ml-blue' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Hasta {formatPrice(50000)}
                  </button>
                  <button
                    onClick={() => setPriceRange([50000, 200000])}
                    className={`w-full px-3 py-1.5 text-sm rounded border ${
                      priceRange[0] === 50000 && priceRange[1] === 200000 ? 'border-ml-blue bg-ml-blue/10 text-ml-blue' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {formatPrice(50000)} - {formatPrice(200000)}
                  </button>
                  <button
                    onClick={() => setPriceRange([200000, 500000])}
                    className={`w-full px-3 py-1.5 text-sm rounded border ${
                      priceRange[0] === 200000 && priceRange[1] === 500000 ? 'border-ml-blue bg-ml-blue/10 text-ml-blue' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {formatPrice(200000)} - {formatPrice(500000)}
                  </button>
                  <button
                    onClick={() => setPriceRange([500000, 1500000])}
                    className={`w-full px-3 py-1.5 text-sm rounded border ${
                      priceRange[0] === 500000 && priceRange[1] === 1500000 ? 'border-ml-blue bg-ml-blue/10 text-ml-blue' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Más de {formatPrice(500000)}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile filters */}
          {showFilters && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  No encontramos productos
                </h2>
                <p className="text-gray-500 mb-6">
                  Prueba cambiando los filtros o buscando otro término
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-ml-blue text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    animationDelay={index * 50}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};