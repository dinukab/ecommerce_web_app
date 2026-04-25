import React from 'react';

interface OrderItem {
  _id?: string;
  product?: string;
  name: string;
  quantity: number;
  price?: number;
  sellingPrice?: number;
  image?: string;
  images?: string[];
}

interface OrderSummaryProps {
  items: OrderItem[];
  deliveryFee?: number;
  subtotal: number;
  isCart?: boolean;
  onCheckout?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items = [], deliveryFee, subtotal, isCart, onCheckout }) => {
  const total = subtotal + (deliveryFee || 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
        {items.map((item, idx) => (
          <div key={item._id || idx} className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
              <img 
                src={item.image || (item.images && item.images[0]) || '/placeholder.png'} 
                alt={item.name} 
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">
                LKR {((item.price || item.sellingPrice || 0) * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-dashed border-gray-200 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-gray-900">LKR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Delivery Fee</span>
          <span className="font-bold text-gray-900">
            {deliveryFee === undefined ? (
              <span className="text-blue-600 text-xs font-medium">Calculated at checkout</span>
            ) : deliveryFee === 0 ? (
              'FREE'
            ) : (
              `LKR ${deliveryFee.toLocaleString()}`
            )}
          </span>
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-xl font-black text-blue-600">
            LKR {total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
          !
        </div>
        <p className="text-[10px] text-blue-700 font-medium">
          Prices include all applicable taxes and service charges.
        </p>
      </div>

      {isCart && (
        <button
          onClick={onCheckout}
          className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default OrderSummary;
