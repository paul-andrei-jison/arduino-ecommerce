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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

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

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files).slice(0, 5);
    imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    setImagePreviews(
      incoming.map(file => ({ url: URL.createObjectURL(file), name: file.name, file }))
    );
    setPrimaryImageIndex(0);
  }

  function handleRemoveImage(idx) {
    URL.revokeObjectURL(imagePreviews[idx].url);
    const next = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(next);
    if (primaryImageIndex === idx) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > idx) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  }

  function resetForm() {
    imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    setImagePreviews([]);
    setPrimaryImageIndex(0);
    setForm(defaultForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      imagePreviews.forEach(({ file }) => formData.append('productImages', file));
      formData.append('primaryImage', String(primaryImageIndex));

      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Server error ${res.status}`);
      }
      setFormSuccess('Product added successfully.');
      resetForm();
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
    { label: 'Price (₱)', name: 'price', type: 'number', placeholder: '1699', step: '0.01', min: '0' },
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

            {/* Binary file upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Product Images{' '}
                <span className="text-gray-600">(optional · up to 5 · hold Ctrl/⌘ to select multiple)</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                name="productImages"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:text-white hover:file:bg-cyan-600 file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Thumbnail previews — click to set primary, × to remove */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Click a thumbnail to set it as the primary card image
                </p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map(({ url, name }, idx) => (
                    <div key={idx} className="relative">
                      {/* Primary selector */}
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIndex(idx)}
                        title={name}
                        className={`block rounded-lg overflow-hidden border-2 transition-colors focus:outline-none ${
                          idx === primaryImageIndex
                            ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <img src={url} alt={name} className="w-20 h-20 object-cover" />
                        {idx === primaryImageIndex && (
                          <span className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 text-white text-xs text-center py-0.5 leading-tight">
                            Primary
                          </span>
                        )}
                      </button>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove image"
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none transition-colors z-10"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      <td className="py-2 pr-3 text-cyan-400">₱{Number(p.price).toFixed(2)}</td>
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
