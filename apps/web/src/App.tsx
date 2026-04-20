import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { HomePage } from './pages/Home';
import { CatalogPage } from './pages/Catalog';

const ProductDetailPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Detalle de Producto</h1>
      <p className="text-gray-500">Página en construcción</p>
    </div>
  </div>
);

const CartPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
      <p className="text-gray-500 mb-6">Encontrá miles de productos esperando por vos</p>
      <a href="/catalog" className="btn-primary inline-block">
        Ver catálogo
      </a>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ml-yellow rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-ml-blue font-bold text-2xl">N</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">¡Hola! Bienvenido de nuevo</h1>
        <p className="text-gray-500 mt-2">Ingresá tu email y contraseña</p>
      </div>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent"
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-ml-blue text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Continuar
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="#" className="text-sm text-ml-blue hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      
      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-gray-500 text-sm">¿No tenés cuenta?</p>
        <a href="/register" className="text-ml-blue font-semibold hover:underline">
          Crear cuenta
        </a>
      </div>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ml-yellow rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-ml-blue font-bold text-2xl">N</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
        <p className="text-gray-500 mt-2">Es gratis y tardás menos de 2 minutos</p>
      </div>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent"
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-ml-blue text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Crear cuenta
        </button>
      </form>
      
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>Al continuar, aceptás nuestros Términos y Condiciones</p>
      </div>
    </div>
  </div>
);

const SellerPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="text-6xl mb-4">💼</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Vende con nosotros</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Unite a miles de vendedores que ya están creciendo con Negociar. 
        Es fácil, rápido y sin costo de publicación.
      </p>
      <a href="/register" className="btn-primary inline-block">
        Empezar a vender
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/seller" element={<SellerPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}

export default App;
