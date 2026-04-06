import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { CartProvider, useCart } from '@/lib/cart'
import { Link } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Hari Om Foods' },
    ],
	links: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png', 
      },
    ],
  }),
  shellComponent: RootDocument,
})

function CartBadge() {
  const { totalItems } = useCart()
  return (
    <Link
      to="/cart"
      className="relative flex items-center gap-1.5 text-sm font-medium text-white hover:text-yellow-300 transition"	
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6"
        />
      </svg>
      Cart
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
		{totalItems}
		</span>
      )}
    </Link>
  )
}

function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* 🔥 Logo + Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="logo.png" // 👈 place your logo in public folder
            alt="Hari Om Foods"
            className="h-10 w-10  object-cover border-2 border-white shadow"
          />
          <div  className="hidden sm:block">
            <p className="text-lg font-bold leading-tight">
              Hari Om Foods Wollongong
            </p>
            <p className="text-xs opacity-80">
              Fresh & Quality Groceries
            </p>
          </div>
        </Link>

        {/* 🧭 Navigation */}
        <nav className="flex items-center gap-5 sm:gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            🛍 Products
          </Link>

          <Link
            to="/contact"
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            📞 Contact Us
          </Link>

          {/* 🛒 Cart */}
          <div className="relative">
            <CartBadge />
          </div>
        </nav>
      </div>
    </header>
  )
}


function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
            <body className="bg-gradient-to-br from-gray-50 to-indigo-50 text-gray-900 min-h-screen">
        <CartProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </CartProvider>
        <Scripts />
      </body>
    </html>
  )
}
