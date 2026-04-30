import React from 'react';
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  processing: {
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: Package,
    label: 'Processing'
  },
  delivered: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    icon: CheckCircle2,
    label: 'Delivered'
  },
  cancelled: {
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: XCircle,
    label: 'Cancelled'
  }
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;

