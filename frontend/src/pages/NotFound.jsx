import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-black text-cyan-400 tracking-tight select-none">404</p>

      <h1 className="mt-4 text-2xl font-bold text-gray-100">Component Not Found</h1>

      <p className="mt-3 max-w-md text-gray-400 text-sm leading-relaxed">
        The requested hardware path or address does not exist in our system module.
        The route may have been removed, renamed, or was never mapped to a handler.
      </p>

      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        ← Return to Catalog
      </Link>
    </main>
  );
}
