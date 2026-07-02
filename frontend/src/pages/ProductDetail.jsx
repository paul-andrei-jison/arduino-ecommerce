import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const php = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setQuantity(1);
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/products/${id}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(res.status === 404 ? 'Product not found.' : `Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || typeof data.stock !== 'number') throw new Error('Product not found.');
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading product...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-500">{error}</p>
          <Link
            to="/shop"
            className="inline-block text-sm font-medium text-white bg-gray-900 px-5 py-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            ← Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        {/* Left — product image or hardware placeholder */}
        {product.imageUrl ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 min-h-80">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            role="img"
            aria-label={`Product image placeholder for ${product.name}`}
            className="bg-gray-900 border-2 border-cyan-700 rounded-2xl flex items-center justify-center min-h-80 relative overflow-hidden"
          >
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500 rounded-tr" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500 rounded-bl" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br" />
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-24 h-24 border-2 border-cyan-600 rounded-xl flex items-center justify-center">
                <svg aria-hidden="true" className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <p className="text-cyan-500 text-xs font-mono tracking-widest uppercase">Arduino Board</p>
            </div>
          </div>
        )}

        {/* Right — product metadata */}
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Category badge + name */}
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1 mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            </div>

            {/* Price */}
            <p className="text-cyan-600 font-bold text-3xl">{php.format(product.price)}</p>

            {/* Stock */}
            <p className={`text-sm font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {outOfStock ? 'Out of Stock' : `${product.stock} units in stock`}
            </p>

            {/* Description */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Quantity stepper + Add to Cart */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={outOfStock || quantity <= 1}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-sm font-medium text-gray-800 w-5 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={outOfStock || quantity >= product.stock}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={outOfStock}
              className="w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
