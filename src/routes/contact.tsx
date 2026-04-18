import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  // 👉 Replace these later with real values
  const whatsappNumber = '61409329031' // AU format (no +)
  const email = 'hariomfoodswollongong@email.com'

  const whatsappLink = `https://wa.me/${whatsappNumber}`
  const emailLink = `mailto:${email}`

  return (
    <div className="max-w-xl mx-auto text-center">

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Contact Us
      </h1>

      <p className="text-gray-500 mb-8">
        Have a question or want to place an order? Reach us directly below.
      </p>

      {/* WhatsApp Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">

        <div className="text-3xl mb-2">💬</div>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          WhatsApp
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Chat with us instantly for orders & support
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Chat on WhatsApp
        </a>
      </div>

      {/* Email Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

        <div className="text-3xl mb-2">✉️</div>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Email
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Send us an email and we’ll respond within 24 hours
        </p>

        <a
          href={emailLink}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Send Email
        </a>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-6">
        We usually respond within a few hours during business time.
      </p>
    </div>
  )
}