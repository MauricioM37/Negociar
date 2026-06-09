import { FormEvent, useCallback, useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { useAuthStore } from '../store/useAuthStore';

interface ProductFormState {
  title: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: File | null;
}

const initialFormState: ProductFormState = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  image: null,
};

export const SellerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSellerProducts = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productService.obtenerMisProductos(user.id);
      setProducts(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No pudimos cargar tus productos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSellerProducts();
  }, [loadSellerProducts]);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingProductId(null);
    setFormVisible(false);
  };

  const openCreateForm = () => {
    setEditingProductId(null);
    setForm(initialFormState);
    setFormVisible(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      image: null,
    });
    setFormVisible(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      if (!editingProductId) {
        const formData = new FormData();
        formData.set('title', form.title);
        formData.set('description', form.description);
        formData.set('price', form.price);
        formData.set('stock', form.stock);
        formData.set('category', form.category);

        if (form.image) {
          formData.set('image', form.image);
        }

        await productService.registrarProducto(formData);
      } else {
        const payload = new FormData();
        payload.set('title', form.title);
        payload.set('description', form.description);
        payload.set('price', form.price);
        payload.set('stock', form.stock);
        payload.set('category', form.category);

        if (form.image) {
          payload.set('image', form.image);
        }

        await productService.actualizarProducto(editingProductId, payload);
      }

      await loadSellerProducts();
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('¿Seguro que querés eliminar este producto?');
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      await productService.eliminarProducto(id);
      await loadSellerProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No pudimos eliminar el producto');
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Panel de vendedor</h1>
            <p className="text-gray-500 mt-1">Gestioná tus productos y mantené tu catálogo actualizado.</p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="px-5 py-3 bg-[#001D3D] text-white rounded-xl font-semibold hover:bg-blue-900 transition-colors"
          >
            Nuevo producto
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {formVisible && (
          <div className="mb-8 bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingProductId ? 'Editar producto' : 'Crear nuevo producto'}
            </h2>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setForm((current) => ({ ...current, image: file }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Guardando...' : editingProductId ? 'Actualizar producto' : 'Crear producto'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Todavía no tenés productos. Creá el primero para empezar a vender.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-left">Precio</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                          <div>
                            <p className="font-semibold text-gray-800">{product.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{product.category}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-gray-700">{product.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(product)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
