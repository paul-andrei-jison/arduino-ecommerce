import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const php = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

function ProductCard({ product, addToCart }) {
  const outOfStock = product.stock === 0;
  const productId = product.PK.replace('PRODUCT#', '');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <Link to={`/products/${productId}`} className="block group">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className="w-full h-36 bg-gray-900 flex items-center justify-center">
            <svg aria-hidden="true" className="w-8 h-8 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
        )}
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-cyan-600 transition-colors leading-snug">
            {product.name}
          </h2>
          <p className="text-cyan-600 font-bold text-lg">{php.format(product.price)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className="w-full bg-gray-900 text-white text-sm font-medium py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

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
          <ProductCard key={product.PK} product={product} addToCart={addToCart} />
        ))}
      </div>
    </main>
  );
}
