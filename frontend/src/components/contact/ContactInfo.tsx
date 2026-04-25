export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Other Ways to Reach Us
        </h3>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Email</p>
              <a
                href="mailto:support@oneshop.com"
                className="text-gray-600 hover:text-blue-600 transition text-sm"
              >
                support@oneshop.com
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.8c.2 1.1.888 4.113 1.949 5.174 1.061 1.06 4.074 1.748 5.175 1.948a1 1 0 01.8.986v2.153a1 1 0 01-1 1h-2C7.82 15 2 9.18 2 2a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Phone</p>
              <a
                href="tel:+15551234567"
                className="text-gray-600 hover:text-blue-600 transition text-sm"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Address</p>
              <p className="text-gray-600 text-sm">
                123 Business Street
                <br />
                New York, NY 10001
                <br />
                United States
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Business Hours
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Monday - Friday</span>
            <span className="font-medium">9:00 AM - 6:00 PM EST</span>
          </div>
          <div className="flex justify-between">
            <span>Saturday</span>
            <span className="font-medium">10:00 AM - 4:00 PM EST</span>
          </div>
          <div className="flex justify-between">
            <span>Sunday</span>
            <span className="font-medium">Closed</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          We typically respond to inquiries within 24 hours.
        </p>
      </div>

      {/* FAQ Quick Link */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-700 mb-4">
          Have a quick question? Check our FAQs for instant answers.
        </p>
        <a
          href="/faqs"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition text-sm"
        >
          View FAQs
        </a>
      </div>
    </div>
  );
}
