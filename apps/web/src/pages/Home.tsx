import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { categories } from '../constants/catalog';
import { useFeaturedProducts } from '../hooks/useProducts';

export const HomePage = () => {
  const { products: featuredProducts = [] } = useFeaturedProducts();
  const [slideIndex, setSlideIndex] = useState(0);

const slides = [
    {
      bg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop', // Imagen original: Tienda/Ropa
      title: 'Tu gran mercado online de todo',
      subtitle: 'TU PRÓXIMA COMPRA ESTÁ AQUÍ',
      cta1: 'Ver ofertas',
      cta2: 'Catálogo completo',
    },
    {
      bg: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1920&auto=format&fit=crop', // Electrónica variada
      title: 'Tecnología y gadgets para todos',
      subtitle: 'SOLUCIONES DIGITALES',
      cta1: 'Explorar tech',
      cta2: 'Vender mi equipo',
    },
    {
      bg: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1920&auto=format&fit=crop', // Artículos de cocina/hogar
      title: 'Renueva tu hogar con lo mejor',
      subtitle: 'ESPACIOS ÚNICOS',
      cta1: 'Ver muebles',
      cta2: 'Decoración',
    },
   {
      bg: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1920&auto=format&fit=crop', // NUEVA IMAGEN: Estante de juguetes
      title: 'Diversión asegurada para los peques',
      subtitle: 'MUNDO DE JUGUETES',
      cta1: 'Ver juegos',
      cta2: 'Regalos',
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Estilo Premium */}
      <section className="relative h-[80vh] overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === slideIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[6000ms]"
              style={{ 
                backgroundImage: `url(${slide.bg})`,
                transform: index === slideIndex ? 'scale(1)' : 'scale(1.1)' 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001D3D]/90 via-[#001D3D]/40 to-transparent" />
            
            <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <span className="inline-block px-3 py-1 rounded-sm bg-green-500 text-[#001D3D] text-[10px] font-black tracking-[0.2em] mb-6">
                  {slide.subtitle}
                </span>
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i}>{word} </span>
                  ))}
                </h1>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-white text-[#001D3D] font-bold rounded-full hover:bg-green-500 transition-all transform hover:scale-105">
                    {slide.cta1}
                  </button>
                  <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:border-white transition-all">
                    {slide.cta2}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Categorías - Minimalistas */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tighter">EXPLORAR</h2>
              <p className="text-gray-400 font-medium">Busca por categorías destacadas</p>
            </div>
            <Link to="/catalog" className="text-sm font-bold text-blue-600 hover:text-[#001D3D] transition-colors pb-1 border-b-2 border-blue-100">
              VER TODAS
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((category) => (
              <Link 
                key={category.id} 
                to={`/catalog?category=${category.id}`} 
                className="group flex flex-col items-center p-8 rounded-3xl bg-gray-50 hover:bg-[#001D3D] transition-all duration-300"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-12 w-2 bg-green-500 rounded-full" />
            <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Ofertas de la semana</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="transform hover:-translate-y-2 transition-all duration-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios - Diseño Moderno */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-tight">Compra Segura</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Tu dinero está protegido en cada transacción que realices.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-tight">Envío Flash</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Logística optimizada para que recibas tus productos en tiempo récord.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white mb-6 shadow-xl shadow-black/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-tight">Mejor Precio</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Negociamos las mejores tarifas para que ahorres en cada compra.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
