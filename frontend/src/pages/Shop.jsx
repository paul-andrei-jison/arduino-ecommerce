import { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Shop() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Failed to load products: {error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
            <p className="text-cyan-600 font-bold text-xl mb-4">{usd.format(product.price)}</p>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
