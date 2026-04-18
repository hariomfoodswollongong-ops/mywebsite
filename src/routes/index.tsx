import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { fetchProducts, type Product } from '@/lib/products'
import { useCart } from '@/lib/cart'

export const Route = createFileRoute('/')({
  component: CatalogPage,
})

function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
        >
          −
        </button>

        <span className="px-3 text-sm font-medium">{qty}</span>

        <button
          onClick={() => setQty((q) => q + 1)}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={`flex-1 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200
          ${
            product.stock === 0
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : added
              ? 'bg-green-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
      >
        {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added' : 'Add'}
      </button>
    </div>
  )
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(price)

function ProductCard({ product }: { product: Product }) {
  const brand = product?.brand || 'Other'

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 p-2"
        />

        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}

        {product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            {product.stock} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Brand */}
        <p className="text-xs text-indigo-500 mb-1 font-medium">
          {brand}
        </p>

        {/* Name */}
        <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
          {product.name}
        </h2>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-auto mb-3">
          <span className="text-lg font-bold text-indigo-600">
            {product.price > 0 ? formatPrice(product.price) : '—'}
          </span>

          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
            Best Price
          </span>
        </div>

        <AddToCartButton product={product} />
      </div>
    </div>
  )
}

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('All')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // 🏷 Brand list
  const brands = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => set.add(p.brand || 'Other'))
    return Array.from(set)
  }, [products])

  // 🔍 + 🏷 FILTER COMBINED
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        `${p.name} ${p.description || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesBrand =
        selectedBrand === 'All' || (p.brand || 'Other') === selectedBrand

      return matchesSearch && matchesBrand
    })
  }, [products, search, selectedBrand])

  // 📦 GROUP AFTER FILTER
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const brand = product.brand || 'Other'
      if (!acc[brand]) acc[brand] = []
      acc[brand].push(product)
      return acc
    }, {} as Record<string, Product[]>)
  }, [filteredProducts])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-16">
        Failed to load products.
      </p>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product List</h1>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} product(s) found
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 🏷 BRAND FILTER */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelectedBrand('All')}
          className={`px-3 py-1 rounded-full text-sm border ${
            selectedBrand === 'All'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          All
        </button>

        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedBrand === brand
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* No results */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-16">
          No products match your search.
        </p>
      ) : (
        Object.entries(groupedProducts).map(([brand, items]) => (
          <div key={brand} className="mb-10">

            {/* Brand Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1 w-10 bg-indigo-600 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900">{brand}</h2>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

          </div>
        ))
      )}
    </>
  )
}