import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Cart() {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl text-gray-500">Your cart is empty.</p>
        <Link
          to="/shop"
          className="text-sm font-medium text-white bg-gray-900 px-5 py-2 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Browse the Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
        {cartItems.map((item) => (
          <li key={item.PK} className="flex items-center justify-between px-5 py-4 bg-white">
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">
                {usd.format(item.price)} &times; {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <p className="font-bold text-gray-800">{usd.format(item.price * item.quantity)}</p>
              <button
                onClick={() => removeFromCart(item.PK)}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6 px-1">
        <span className="text-lg font-semibold text-gray-700">Total</span>
        <span className="text-2xl font-bold text-gray-900">{usd.format(total)}</span>
      </div>
    </main>
  );
}
