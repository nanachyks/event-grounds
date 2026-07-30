import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | EventGrounds",
  description: "The terms that govern use of EventGrounds by customers and venue vendors.",
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">1. What EventGrounds Is</h2>
          <p>EventGrounds is an online marketplace that connects customers looking for event venues (&ldquo;Customers&rdquo;) with venue owners and managers (&ldquo;Vendors&rdquo;) across Ghana. EventGrounds facilitates discovery, booking inquiries, and payment for venue bookings, but does not itself own, operate, or manage any listed venue.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">2. Accounts</h2>
          <p>Vendors must create an account to list a venue. You are responsible for keeping your login credentials confidential and for all activity under your account. You must provide accurate, current information when creating a listing or making a booking.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">3. Listings and Approval</h2>
          <p>Every venue submitted by a Vendor is reviewed before it appears publicly on EventGrounds. We may approve, reject, or remove a listing at our discretion, including after it has gone live, if it is inaccurate, misleading, or violates these Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">4. Bookings and Payment</h2>
          <p>When a Customer submits a booking inquiry, the Vendor confirms availability before payment is requested. Payments are processed securely through Paystack. EventGrounds retains a commission on each completed booking; the remainder is owed to the Vendor.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">5. Cancellations and Refunds</h2>
          <p>Each venue publishes its own cancellation policy and notice period, shown on the venue&apos;s page before booking. Refunds are handled according to that policy — see our <a href="/refund-policy" className="text-green-600 underline">Refund Policy</a> for details.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">6. Vendor Responsibilities</h2>
          <p>Vendors are responsible for the accuracy of their listings, the condition and safety of their venue, and honouring confirmed bookings. EventGrounds is not a party to the agreement between a Customer and a Vendor and is not liable for the conduct of either.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">7. Prohibited Use</h2>
          <p>You may not use EventGrounds to list a venue you do not have the right to offer, to submit false booking requests, or to attempt to circumvent our payment and commission process.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">8. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of EventGrounds after a change takes effect constitutes acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">9. Contact</h2>
          <p>Questions about these Terms can be sent to <a href="mailto:info@eventgrounds.com" className="text-green-600 underline">info@eventgrounds.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
