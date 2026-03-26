"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuantityPicker from "@/components/quantity-picker";
import { ArrowLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import AddToCartButton from "@/components/add-to-cart-button";
import OrderSummary from '@/components/OrderSummary';



type CartItem = {
  id: string;
  name: string;
  details: string;
  status: "in-stock" | "low-stock" | "out-stock";
  price: number;
  quantity: number;
  total: number;

};

// Sample cart items above return
export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "005",
      name: "Product_005",
      details: "Volume: 1ea | Size: Medium",
      status: "in-stock",
      price: 200,
      quantity: 2,
      total: 400,
    },
    {
      id: "006",
      name: "Product_006",
      details: "Volume: 200ml",
      status: "in-stock",
      price: 300,
        quantity: 1,
        total: 300,
    },
    {
      id: "007",
      name: "Product_007",
      details: "Size: S | Color: White",
      status: "low-stock",
      price: 400,
        quantity: 1,
        total: 400,
    },
  ]);

  //calculation of order summary
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shipping = 400;           // you can make dynamic later                  // or calculate if needed
  const discount = 0;             // placeholder – later from promo

  const orderTotal = subtotal + shipping - discount;

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Update quantity and total price
  const updateQuantity = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: qty, total: item.price * qty } : item
      )
    );
  };

  // Add recommended product to cart
  const addToCartFromRecommended = (product: { id: string; name: string; price: number; image: string }) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          details: "",
          status: "in-stock",
          price: product.price,
          quantity: 1,
          total: product.price,
        },
      ]);
    }
  };

  // Sample recommended products above return
  const recommendedProducts = [
    {
      id: "009",
      name: "Product_009",
      price: 4500,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "010",
      name: "Product_010",
      price: 1800,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "011",
      name: "Product_011",
      price: 2200,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "012",
      name: "Product_012",
      price: 200,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "013",
      name: "Product_013",
      price: 750,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "014",
      name: "Product_014",
      price: 1400,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "015",
      name: "Product_015",
      price: 1220,
      image: "https://via.placeholder.com/300x220",
    },
    {
      id: "016",
      name: "Product_016",
      price: 860,
      image: "https://via.placeholder.com/300x220",
    },
  ];


  
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <h1 style={{ fontSize: "24px",color: "#333", fontWeight: "bold" }}>Your Cart</h1>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        You have {cartItems.length} items in your cart.{" "}
      </p>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Column - Cart Items */}
        <div>

      {/* Column Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 120px 100px",
          gap: "20px",
          padding: "10px 0",
          marginBottom: "15px",
          borderBottom: "2px solid #ddd",
          fontWeight: "600",
          fontSize: "12px",
          color: "black",
        }}
      >
        <div>Product</div>
        <div style={{ textAlign: "center" }}>Price</div>
        <div style={{ textAlign: "center" }}>Quantity</div>
        <div style={{ textAlign: "right" }}>Total</div>
      </div>

      {/* LEFT:Cart Items */}
      {cartItems.map((item) => (
        <div key={item.id}>
          {/* Product Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 120px 100px",
              gap: "20px",
              alignItems: "flex-start",
              padding: "15px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            {/* PRODUCT COLUMN */}
            <div style={{ display: "flex", gap: "15px" }}>
              {/* Image */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#ccc",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              />

              {/* Details */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937", margin: "0 0 5px 0" }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: "11px", color: "#666", margin: "0 0 5px 0" }}>
                  {item.details}
                </p>

                {/* Status */}
                <p
                  style={{
                    fontSize: "11px",
                    color:
                      item.status === "in-stock"
                        ? "green"
                        : item.status === "low-stock"
                        ? "orange"
                        : "red",
                    margin: "0 0 8px 0",
                  }}
                >
                  ● {item.status.replace("-", " ")}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    fontSize: "11px",
                    color: "#8B4513",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* PRICE COLUMN */}
            <div style={{ textAlign: "center", paddingTop: "5px" }}>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#1f2937" }}>
                Rs.{item.price.toLocaleString()}
              </p>
            </div>

            {/* QUANTITY COLUMN */}
            <div style={{ textAlign: "center", paddingTop: "5px" }}>
              <QuantityPicker
                value={item.quantity}
                onChange={(qty: number) => updateQuantity(item.id, qty)}
                min={1}
              />
            </div>

            {/* TOTAL COLUMN */}
            <div style={{ textAlign: "right", paddingTop: "5px" }}>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#1f2937" }}>
                Rs.{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}

     {/* Empty cart */}
      {cartItems.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "40px", color: "#999" }}>
          Your cart is empty
        </p>
      )} 



 {/* Continue Shopping Button */}
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "90px",
          padding: "10px 6px",
          fontSize: "16px",
          fontWeight: "700",
          color: "#151194",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
        }}
      >
        <ArrowLeft size={20} />
        Continue Shopping
      </button>
      

      


      {/* Recommended Another Products */}
      <div className="mt-18">
        <h2 className="text-lg font-semibold mb-4 text-black">
          You may also like...
        </h2>

        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="overflow-visible">
            {recommendedProducts.map((product) => (
              <CarouselItem key={product.id} className="basis-1/4 md:basis-1/4 lg:basis-1/6 p-2">
                <div className=" rounded-xl w-full bg-white hover:shadow-lg p-3 cursor-pointer ">
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg  w-full bg-gray-200 ">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover rounded mb-2"
                    />
                    <div className="absolute bottom-2 right-2"></div>
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-500 text-sm shadow cursor-pointer"
                      aria-label="Add to cart"
                      onClick={() => addToCartFromRecommended(product)}
                    >
                      🛒
                    </button>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-600">
                    Rs.{product.price.toLocaleString()}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className= "absolute left-0  top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-6 h-fit">
          <OrderSummary
            subtotal={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            shipping={400}
            
            orderTotal={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 400}
            cartItems={cartItems}
          />
        </div>
      </div>
    </div>
  );
}
