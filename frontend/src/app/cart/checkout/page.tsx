"use client"

import { useRouter } from "next/navigation"
import { CardNumberInput, FormInput } from "@/components/FormInput"
import OrderSummary from "@/components/OrderSummary"
import { Button } from "@/components/ui/button"

import { ProvinceSelect } from "@/components/ProvinceSelect"
import { DistrictSelect } from "@/components/DistrictSelect"
import { CitySelect } from "@/components/CitySelect"

import { useState, useEffect } from "react"

type CartItem = {
  id: string
  name: string
  details: string
  price: number
  quantity: number
  total: number
}

export default function CheckoutPage() {

  const router = useRouter()

  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")

  // Reset district and city when province changes
  useEffect(() => {
    setDistrict("")
    setCity("")
  }, [province])

  // Reset city when district changes
  useEffect(() => {
    setCity("")
  }, [district])

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

  const getInputValue = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null
    return input?.value?.trim() ?? ""
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const checkoutData = {
      email: getInputValue("email"),
      emailOffers: false,
      fullName: getInputValue("fullName"),
      province: province,
      phoneNumber: getInputValue("Phone Number"),
      district: district,
      buildingAddress: getInputValue("Bulding No./House No./Floor/Street"),
      city: city,
      colonyLocality: getInputValue("Colony/Suburd/Locality/Landmark"),
      address: getInputValue("Address"),
      cardNumber: getInputValue("card-number"),
      nameOnCard: getInputValue("Name on Card"),
      expirationDate: getInputValue("Expiry Date"),
      cvc: getInputValue("CVV"),
    }

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData))
    localStorage.setItem("orderTotals", JSON.stringify({ subtotal, shipping, orderTotal }))
    localStorage.setItem("checkoutCartItems", JSON.stringify(cartItems))

    router.push("/cart/checkout/ReviewOrder")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl font-bold mb-8 text-black">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="md:col-span-2 space-y-8">

            {/* Customer Info */}
            <div className="bg-white p-9 rounded-xl shadow-sm">

              <h2 className="text-lg font-semibold mb-4 text-black">
                Customer Information
              </h2>

              <div className="space-y-4">

                <FormInput
                
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

                <p className="text-xs text-gray-500">
                  Enter your email to get delivery status updates.
                </p>

              </div>

            </div>


            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm">

              <h2 className="text-lg font-semibold mb-4 text-black">
                Shipping Address
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <FormInput
                  id="fullName"
                  label="Full Name"
                  placeholder="Enter your first and last name"
                  inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

                {/* Province Combobox */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Province</label>
                  <ProvinceSelect
                    value={province}
                    setValue={setProvince}
                  />
                </div>

                <FormInput
                  id="Phone Number"
                  label="Phone Number"
                  placeholder="Please enter your phone number"
                   inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

                {/* District Combobox */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">District</label>
                  <DistrictSelect
                    province={province}
                    value={district}
                    setValue={setDistrict}
                  />
                </div>

                <FormInput
                  id="Bulding No./House No./Floor/Street"
                  label="Building No./House No./Floor/Street"
                  placeholder="Please enter"
                  inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

                {/* City Combobox */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <CitySelect
                    province={province}
                    district={district}
                    value={city}
                    setValue={setCity}
                  />
                </div>

                <FormInput
                  id="Colony/Suburd/Locality/Landmark"
                  label="Colony/Suburb/Locality/Landmark"
                  placeholder="Please enter"
                  inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

                <FormInput
                  id="Address"
                  label="Complete Address"
                  placeholder="No.123,Street#,ABC Road"
                  inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                />

              </div>

            </div>


            {/* Payment */}
            <div className="bg-white p-6 rounded-xl shadow-sm">

              <h2 className="text-lg font-semibold mb-4 text-black">
                Credit/Debit Card
              </h2>

              <div className="space-y-4">

                <CardNumberInput />

                <div className="space-y-4 mt-4">

                  <FormInput
                    id="Name on Card"
                    label="Name on Card"
                    placeholder="Name on card"
                    inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">

                    <FormInput
                      id="Expiry Date"
                      label="Expiry Date"
                      placeholder="MM/YY"
                      inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                    />

                    <FormInput
                      id="CVV"
                      label="CVV"
                      placeholder="CVV"
                      inputClassName="text-gray-600 placeholder:text-gray-400 text-sm"
                    />

                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    We will save this card for your convenience.
                    If required, you can remove the card in the
                    "Payment Options" section in the "Account" menu.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* RIGHT SIDE */}
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


          {/* Button */}
          <div className="mt-8 md:col-span-3">

            <Button
              type="submit"
              className="mt-6 h-11 w-60 bg-[#151194] hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-sm transition"
            >
              Continue to Review
            </Button>

          </div>

        </form>

      </div>

    </div>
  )
}