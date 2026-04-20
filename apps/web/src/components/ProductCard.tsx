import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  animationDelay?: number;
}

export const ProductCard = ({ product, variant = 'default', animationDelay = 0 }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars || (i === fullStars && hasHalfStar) 
                ? 'text-ml-yellow fill-current' 
                : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-500 ml-1 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <Link 
        to={`/product/${product.id}`}
        className="block animate-fade-in"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
          <img
            src={product.image}
            alt={product.title}
            className="w-14 h-14 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 text-sm truncate">
              {product.title}
            </h3>
            <p className="text-base font-bold text-ml-blue mt-0.5">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/product/${product.id}`}
        className="block animate-fade-in"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all">
          <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-medium text-gray-800 line-clamp-2 hover:text-ml-blue transition-colors">
              {product.title}
            </h3>
            <div className="mt-2">{renderStars(product.rating)}</div>
            <div className="mt-auto">
              {hasDiscount && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(product.originalPrice!)}
                </p>
              )}
              <p className="text-xl font-bold text-ml-blue">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Link to={`/product/${product.id}`}>
        <div className="card-product group">
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            
            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-ml-red text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
            
            {/* Stock badges */}
            {product.stock === 0 && (
              <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                Sin stock
              </div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute top-3 right-3 bg-ml-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded">
                ¡Últimas {product.stock}!
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-800 line-clamp-2 min-h-[3.5rem] group-hover:text-ml-blue transition-colors">
              {product.title}
            </h3>
            
            <div className="mt-3">
              {hasDiscount && (
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice!)}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ml-blue">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-ml-green font-medium">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-1">
              {renderStars(product.rating)}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">{product.seller}</span>
            </div>
            
            {product.stock > 0 && product.stock <= 3 && (
              <div className="mt-2 text-xs text-ml-red font-medium">
                ¡Poco stock disponible!
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};