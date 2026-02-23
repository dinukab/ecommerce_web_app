import { CardNumberInput, FormInput } from "@/components/FormInput"
import OrderSummary from "@/components/OrderSummary"

type CartItem = {
  id: string
  name: string
  details: string
  price: number
  quantity: number
  total: number
}

export default function CheckoutPage() {
  // Placeholder data; replace with real cart values when available
  const cartItems: CartItem[] = [
    {
      id: "005",
      name: "Product_005",
      details: "Volume: 1ea | Size: Medium",
      price: 200,
      quantity: 2,
      total: 400,
    },
    {
      id: "006",
      name: "Product_006",
      details: "Volume: 200ml",
      price: 300,
      quantity: 1,
      total: 300,
    },
    {
      id: "007",
      name: "Product_007",
      details: "Size: S | Color: White",
      price: 400,
      quantity: 1,
      total: 400,
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 400
  const orderTotal = subtotal + shipping

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT SIDE – Customer Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-9 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>

              <div className="space-y-4">
                <FormInput id="email" label="Email Address" type="email" placeholder="Enter your email" />
                <p className="text-xs text-gray-500">Enter your email to get delivery status updates.</p>
              </div>
            </div>

            {/* Shipping Address Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormInput id="fullName" label="Full Name" placeholder="Enter your first and last name" />
                <FormInput id="Province" label="Province" placeholder="Please choose your province" />
                <FormInput id="Phone Number" label="Phone Number" placeholder="Please enter your phone number" />
                <FormInput id="District" label="District" placeholder="Please choose your district" />
                <FormInput id="Bulding No./House No./Floor/Street" label="Building No./House No./Floor/Street" placeholder="Please enter" />
                <FormInput id="City" label="City" placeholder="Please choose your city" />
                <FormInput id="Colony/Suburd/Locality/Landmark" label="Colony/Suburb/Locality/Landmark" placeholder="Please enter" />
                <FormInput id="Address" label="Complete Address" placeholder="No.123,Street#,ABC Road" />
              </div>
            </div>

            {/* Payment Method details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Credit/Debit Card</h2>
              <div className="space-y-4">
                <CardNumberInput />

                <div className="space-y-4 mt-4">
                  <FormInput id="Name on Card" label="Name on Card" placeholder="Name on card" />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormInput id="Expiry Date" label="Expiry Date" placeholder="MM/YY" />
                    <FormInput id="CVV" label="CVV" placeholder="CVV" />
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    We will save this card for your convenience. If required, you can remove the card in the "Payment Options" section in the "Account" menu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – Order Summary */}
          <div className="h-fit sticky top-6">
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              orderTotal={orderTotal}
              cartItems={cartItems}
              hideCheckoutButton
              hidePromoCode
              
            />
          </div>
        </div>
      </div>
    </div>
  )
}
