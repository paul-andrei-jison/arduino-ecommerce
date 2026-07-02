import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];

export default function Navbar() {
  const { cartItems } = useContext(CartContext);
  const { user, logoutUser } = useContext(AuthContext);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const activeClass = 'text-cyan-400 font-semibold';
  const idleClass = 'hover:text-cyan-300 transition-colors';

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <span className="text-xl font-bold tracking-wide">Arduino Store</span>
      <ul className="flex gap-6 items-center">
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => (isActive ? activeClass : idleClass)}>
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? activeClass : idleClass)}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </NavLink>
        </li>
        {user ? (
          <>
            <li className="text-gray-300 text-sm">Welcome, {user.name}</li>
            <li>
              <button
                onClick={logoutUser}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login" className={({ isActive }) => (isActive ? activeClass : idleClass)}>
              Login / Sign Up
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
