import { useState, useEffect } from 'react';

const API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/products`;

const defaultForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Server error ${res.status}`);
      }
      setFormSuccess('Product added successfully.');
      setForm(defaultForm);
      await loadProducts();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(productPK) {
    const cleanId = productPK.replace('PRODUCT#', '');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/products/${cleanId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.PK !== productPK));
      } else {
        setFetchError(`Delete failed (${res.status})`);
      }
    } catch (err) {
      setFetchError(err.message);
    }
  }

  const fields = [
    { label: 'Name', name: 'name', type: 'text', placeholder: 'Arduino Uno' },
    { label: 'Description', name: 'description', type: 'text', placeholder: 'Brief description' },
    { label: 'Category', name: 'category', type: 'text', placeholder: 'Microcontrollers' },
    { label: 'Price ($)', name: 'price', type: 'number', placeholder: '29.99', step: '0.01', min: '0' },
    { label: 'Stock', name: 'stock', type: 'number', placeholder: '100', min: '0' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Left Column: Add Product Form ── */}
        <section className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">Add New Product</h2>

          {formError && (
            <div className="mb-4 rounded-lg bg-red-900/40 border border-red-600 text-red-300 px-4 py-2 text-sm">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 rounded-lg bg-green-900/40 border border-green-600 text-green-300 px-4 py-2 text-sm">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ label, name, type, placeholder, step, min }) => (
              <div key={name}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  min={min}
                  step={step}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors mt-2"
            >
              Add Product
            </button>
          </form>
        </section>

        {/* ── Right Column: Product Table ── */}
        <section className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">
            All Products
            <span className="ml-2 text-sm text-gray-400 font-normal">({products.length})</span>
          </h2>

          {fetchError && (
            <div className="mb-4 rounded-lg bg-red-900/40 border border-red-600 text-red-300 px-4 py-2 text-sm">
              {fetchError}
            </div>
          )}

          {loading ? (
            <p className="text-gray-400 text-sm animate-pulse">Loading products…</p>
          ) : products.length === 0 && !fetchError ? (
            <p className="text-gray-500 text-sm">No products found. Add one using the form.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2 pr-3 font-medium">Name</th>
                    <th className="pb-2 pr-3 font-medium">Category</th>
                    <th className="pb-2 pr-3 font-medium">Price</th>
                    <th className="pb-2 pr-3 font-medium">Stock</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.PK}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-2 pr-3 text-gray-100 font-medium">{p.name}</td>
                      <td className="py-2 pr-3 text-gray-400">{p.category}</td>
                      <td className="py-2 pr-3 text-cyan-400">${Number(p.price).toFixed(2)}</td>
                      <td className="py-2 pr-3 text-gray-400">{p.stock}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(p.PK)}
                          className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
