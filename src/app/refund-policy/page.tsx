import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund Policy | EventGrounds",
  description: "How cancellations and refunds work for bookings made through EventGrounds.",
}

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
      <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Each Venue Sets Its Own Notice Window</h2>
          <p>Every venue on EventGrounds publishes a cancellation notice window on its listing page — for example, &ldquo;full refund if cancelled at least 48 hours before your event.&rdquo; This window is set by the Vendor and shown before you book, so you know the terms in advance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">How Refund Eligibility Works</h2>
          <p>If a paid booking is cancelled with enough notice — at or beyond the venue&apos;s stated window before the event&apos;s start date — the full amount is refunded to the original payment method via Paystack. If a booking is cancelled inside that window, it is not eligible for a refund. Bookings that were never paid for (pending or rejected inquiries) have nothing to refund.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Requesting a Cancellation</h2>
          <p>To cancel a booking, contact the venue directly using the WhatsApp link on your booking confirmation page, or email <a href="mailto:info@eventgrounds.com" className="text-green-600 underline">info@eventgrounds.com</a> with your booking reference. The Vendor or EventGrounds support will process the cancellation and, if eligible, issue the refund.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Refund Timing</h2>
          <p>Once a refund is issued, it is sent back through Paystack to your original payment method. Paystack and your bank or mobile money provider typically take a few business days to reflect the refund on your end — this is outside EventGrounds&apos; control.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Disputes</h2>
          <p>If you believe a cancellation was handled incorrectly, email <a href="mailto:info@eventgrounds.com" className="text-green-600 underline">info@eventgrounds.com</a> with your booking reference and we will review it.</p>
        </section>
      </div>
    </div>
  )
}
