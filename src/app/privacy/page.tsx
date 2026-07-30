import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | EventGrounds",
  description: "How EventGrounds collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">1. Information We Collect</h2>
          <p>When you book a venue, we collect your name, email address, and phone number so the Vendor can confirm and fulfil your booking. When you sign up as a Vendor, we collect your name, email, phone number, and venue details. Payments are processed by Paystack, which collects payment card or mobile money details directly — EventGrounds never sees or stores your full payment credentials.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">2. How We Use It</h2>
          <p>We use this information to process bookings, communicate booking status, send password-reset emails, respond to support requests, and detect fraudulent or abusive use of the platform. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">3. Who We Share It With</h2>
          <p>Booking details (name, contact information, and event dates) are shared with the Vendor whose venue you book, so they can confirm and prepare for your event. We use Paystack to process payments and Cloudinary to host venue images. These providers process data on our behalf and are contractually restricted from using it for their own purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">4. Data Retention</h2>
          <p>We retain booking and account records for as long as needed to provide the service, resolve disputes, and meet our legal and accounting obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">5. Your Choices</h2>
          <p>Vendors can review and update their account details from their dashboard at any time. To request access to, correction of, or deletion of your personal data, contact us at the address below.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">6. Cookies &amp; Analytics</h2>
          <p>EventGrounds uses only the minimum session cookies required to keep you signed in to your Vendor or Admin account. We do not use third-party advertising or tracking cookies. We use Plausible Analytics to understand overall site traffic - it does not use cookies and does not collect or store any personal or cross-site identifying information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-700 mb-2">7. Contact</h2>
          <p>Questions about this Privacy Policy can be sent to <a href="mailto:info@eventgrounds.com" className="text-green-600 underline">info@eventgrounds.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
