import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import emailjs from '@emailjs/browser'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useCart()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) return

    // ✅ Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(4\d{8}|04\d{8})$/ // supports 412... and 0412...

    const isEmailValid = !form.email || emailRegex.test(form.email)

    if (!form.name || !isEmailValid || !phoneRegex.test(form.phone)) {
      setSubmitError(true)
      return
    }

    setSubmitting(true)
    setSubmitError(false)

    try {
      // 👉 Normalize phone
      let normalized = form.phone
      if (normalized.startsWith('04')) {
        normalized = normalized.substring(1)
      }
      const fullPhone = `+61${normalized}`

      // ✅ Build HTML table
      const rows = items
        .map(
          ({ product, quantity }) => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #ddd;">${product.name}</td>
          <td style="padding:6px;text-align:center;border-bottom:1px solid #ddd;">${quantity}</td>
          <td style="padding:6px;text-align:right;border-bottom:1px solid #ddd;">$${product.price.toFixed(2)}</td>
          <td style="padding:6px;text-align:right;border-bottom:1px solid #ddd;">$${(
            product.price * quantity
          ).toFixed(2)}</td>
        </tr>
      `
        )
        .join('')

      const orderHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px;border-bottom:2px solid #333;">Product</th>
              <th style="text-align:center;padding:6px;border-bottom:2px solid #333;">Qty</th>
              <th style="text-align:right;padding:6px;border-bottom:2px solid #333;">Price</th>
              <th style="text-align:right;padding:6px;border-bottom:2px solid #333;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td colspan="3" style="padding:6px;text-align:right;font-weight:bold;border-top:2px solid #333;">
                Order Total
              </td>
              <td style="padding:6px;text-align:right;font-weight:bold;border-top:2px solid #333;">
                $${totalPrice.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      `

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          customer_name: form.name,
          customer_email: form.email || 'Not provided',
          customer_phone: fullPhone,
          customer_message: form.message || 'No message',
          order_html: orderHTML,
          order_total: totalPrice.toFixed(2),
          vendor_email: 'your@email.com',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setSubmitted(true)
      clearCart()
    } catch (err) {
      console.error('EmailJS Error:', err)
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ Success Page
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Received!
        </h1>
        <p className="text-gray-500 mb-6">
          Thanks for your order. We'll contact you shortly.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">Your cart is empty.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 🛒 Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white border p-4 rounded-xl flex justify-between"
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    ${product.price.toFixed(2)} each
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="font-bold text-indigo-600">
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* 🧾 Summary + Form */}
          <div className="bg-white border p-6 rounded-xl">
            <h2 className="font-bold mb-4">Order Summary</h2>

            <div className="mb-4 text-sm">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <span>{product.name} × {quantity}</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* 📢 Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-4 rounded-lg mb-2 text-center">
  <p className="text-sm text-indigo-800 font-semibold tracking-wide">
    Please provide your details to complete the order
  </p>
</div>

            <p className="text-xs text-gray-500 mb-4">
              Email optional. Enter mobile: 412345678 or 0412345678
            </p>

            {/* 📝 Form */}
            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                name="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={handleField}
                className="w-full border p-2 rounded"
              />

              <input
                type="email"
                name="email"
                placeholder="john@example.com (optional)"
                value={form.email}
                onChange={handleField}
                className="w-full border p-2 rounded"
              />

              {/* 📱 Phone */}
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-100 text-gray-600 rounded-l">
                  +61
                </span>

                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="412345678 or 0412345678"
                  value={form.phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '')
                    setForm((f) => ({ ...f, phone: cleaned }))
                  }}
                  className="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <textarea
                name="message"
                placeholder="Delivery notes..."
                value={form.message}
                onChange={handleField}
                className="w-full border p-2 rounded"
              />

              {submitError && (
                <p className="text-red-500 text-sm">
                  Please enter valid name and mobile number.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                {submitting ? 'Sending...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default CartPage