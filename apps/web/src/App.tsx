import { FormEvent, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/Home';
import { CatalogPage } from './pages/Catalog';
import { authService } from './services/authService';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SellerDashboard } from './pages/SellerDashboard';
import { ProductDetailPage } from './pages/ProductDetail';

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalPrice = useCartStore((state) => state.totalPrice());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-500 mb-6">Encontrá miles de productos esperando por vos</p>
          <Link to="/catalog" className="btn-primary inline-block">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tu carrito</h1>

        <div className="space-y-4">
          {items.map(({ product, quantity }) => {
            const itemSubtotal = product.price * quantity;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">
                    {product.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Precio: {formatPrice(product.price)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <div className="sm:w-40 text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Subtotal</p>
                  <p className="text-lg font-bold text-ml-blue">{formatPrice(itemSubtotal)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-ml-blue">{formatPrice(totalPrice)}</span>
          </div>

          <button className="w-full py-3 bg-[#001D3D] text-white rounded-lg font-semibold hover:bg-blue-900">
            Proceder al pago
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const onLogin = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      onLogin(result.token, result.user);
      navigate('/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-card">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ml-yellow rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-ml-blue font-bold text-2xl">N</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            ¡Hola! Bienvenido de nuevo
          </h1>

          <p className="text-gray-500 mt-2">
            Ingresá tu email y contraseña
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-ml-blue text-white rounded-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Continuar'}
          </button>

        </form>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-ml-blue font-semibold hover:underline">
            Crear cuenta
          </Link>
        </div>

      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const onLogin = useAuthStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await authService.register({ name, email, password });
      onLogin(result.token, result.user);
      navigate('/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos crear tu cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-card">

        <h1 className="text-2xl font-bold text-center mb-6">
          Crear cuenta
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-ml-blue text-white rounded-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>

        </form>

      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>

      <Route element={<MainLayout />}>

        <Route path="/" element={<HomePage />} />

        <Route path="/catalog" element={<CatalogPage />} />

        <Route path="/product/:id" element={<ProductDetailPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/seller"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

      </Route>

    </Routes>
  );
}

export default App;