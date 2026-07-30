export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">EventGrounds</h3>
            <p className="text-sm">Book the perfect venue for your next event. Trusted by event organizers across Ghana.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/grounds" className="hover:text-amber-400">Browse Grounds</a></li>
              <li><a href="/vendor/signup" className="hover:text-amber-400">Become a Host</a></li>
              <li><a href="/admin/login" className="hover:text-amber-400">Admin Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms" className="hover:text-amber-400">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-amber-400">Privacy Policy</a></li>
              <li><a href="/refund-policy" className="hover:text-amber-400">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>info@eventgrounds.com</li>
              <li>+233 50 123 4567</li>
              <li>Accra, Ghana</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} EventGrounds. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
