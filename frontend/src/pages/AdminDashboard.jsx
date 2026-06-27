import { useState, useEffect } from 'react';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const emptyForm = { name: '', description: '', category: '', price: '', stock: '' };

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const created = await res.json();
      // Normalize the POST response shape to match GET items (which carry PK)
      setProducts((prev) => [{ ...created, PK: `PRODUCT#${created.id}` }, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    const id = product.PK.replace('PRODUCT#', '');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.PK !== product.PK));
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading inventory...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Failed to load inventory: {error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Form Panel ── */}
        <section className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Add Product</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Arduino Uno R3"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Product description..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  placeholder="Microcontrollers"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="100"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        </section>

        {/* ── Inventory Table ── */}
        <section className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Active Inventory
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({products.length} {products.length === 1 ? 'item' : 'items'})
                </span>
              </h2>
            </div>

            {products.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-500">
                No products yet. Add one using the form.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Category</th>
                      <th className="px-6 py-3 text-left">Price</th>
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-left" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.PK} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                        <td className="px-6 py-4 text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 text-cyan-600 font-bold">{usd.format(product.price)}</td>
                        <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
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
          </div>
        </section>
      </div>
    </main>
  );
}
