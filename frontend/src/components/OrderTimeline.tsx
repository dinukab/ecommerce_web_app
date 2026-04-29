import React from 'react';
import { 
  Check, 
  Circle, 
  Clock, 
  Package, 
  Truck 
} from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  updatedAt?: string;
}

const steps = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Check }
];

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status.toLowerCase());

  return (
    <div className="py-8">
      <div className="relative flex justify-between items-start">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-brand transition-all duration-500 -z-10" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                  isCompleted 
                    ? 'bg-brand border-brand-light text-white shadow-lg shadow-brand-light' 
                    : 'bg-white border-gray-100 text-gray-300'
                } ${isCurrent ? 'animate-pulse scale-110' : ''}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  isCompleted ? 'text-brand' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;

