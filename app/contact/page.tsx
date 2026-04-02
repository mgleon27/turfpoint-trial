export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-[800px] mx-auto">

        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <p className="text-gray-700 mb-4">
          If you have any questions, issues, or need assistance regarding bookings,
          payments, or your account, feel free to contact us.
        </p>

        <div className="space-y-2 text-gray-800">
          <p><strong>Email:</strong> admin.turfia@gmail.com</p>
          <p><strong>Phone:</strong> +91 XXXXX XXXXX</p>
          <p><strong>Location:</strong> Tirunelveli, Tamil Nadu, India</p>
        </div>

        <p className="mt-6 text-gray-600">
          We aim to respond within 24 hours.
        </p>

      </div>
    </div>
  );
}