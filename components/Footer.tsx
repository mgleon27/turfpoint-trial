export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 mt-16">
      
      {/* TOP SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-white">Turfia</h2>
          <p className="text-sm mt-3 text-gray-400">
            Book your favorite turf anytime, anywhere. Play more. Stress less.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-4">
            <span className="cursor-pointer hover:text-white">Instagram</span>
            <span className="cursor-pointer hover:text-white">Twitter</span>
            <span className="cursor-pointer hover:text-white">YouTube</span>
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-white font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Browse Turfs</li>
            <li className="hover:text-white cursor-pointer">Popular Locations</li>
            <li className="hover:text-white cursor-pointer">Offers</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <p className="text-sm text-gray-400">support@turfia.in</p>
          <p className="text-sm text-gray-400 mt-2">+91 XXXXX XXXXX</p>

          {/* CTA */}
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition">
            List Your Turf
          </button>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-800"></div>

      {/* BOTTOM SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Turfia. All rights reserved.</p>

        <div className="flex gap-4 mt-3 md:mt-0">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Refund Policy</span>
        </div>
      </div>
    </footer>
  );
}