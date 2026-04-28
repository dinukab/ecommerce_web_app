'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleCheckBig, Lock, ShoppingBag, Truck } from 'lucide-react';

type CheckoutData = {
	email: string;
	cardNumber: string;
};

type OrderTotals = {
	subtotal: number;
	shipping: number;
	orderTotal: number;
};

type CartItem = {
	id: string;
	name: string;
	quantity: number;
	total: number;
};

type FinalOrderData = {
	orderNumber: string;
	placedAt: string;
	checkoutData: CheckoutData;
	orderTotals: OrderTotals;
	cartItems: CartItem[];
};

const formatCurrency = (value: number) => `Rs.${value.toLocaleString()}`;

export default function FinalOrderPage() {
	const [order, setOrder] = useState<FinalOrderData | null>(null);

	useEffect(() => {
		const savedFinalOrder = localStorage.getItem('finalOrderData');
		if (!savedFinalOrder) {
			return;
		}

		try {
			const parsed = JSON.parse(savedFinalOrder) as FinalOrderData;
			setOrder(parsed);
		} catch {
			setOrder(null);
		}
	}, []);

	if (!order) {
		return (
			<div className="min-h-screen bg-[#eef0f2] px-4 py-16">
				<div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-[#1a1f36]">Order confirmation not found</h1>
					<p className="mt-3 text-sm text-slate-600">Please complete your checkout to view this page.</p>
					<Link
						href="/cart/checkout"
						className="mt-6 inline-flex rounded-full bg-[#1d2395] px-6 py-3 text-sm font-semibold text-white hover:bg-[#171c79]"
					>
						Go to Checkout
					</Link>
				</div>
			</div>
		);
	}

	const placedDate = new Date(order.placedAt);
	const deliveryStart = new Date(placedDate);
	deliveryStart.setDate(placedDate.getDate() + 2);
	const deliveryEnd = new Date(placedDate);
	deliveryEnd.setDate(placedDate.getDate() + 3);

	const orderDate = placedDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

	const deliveryWindow = `${deliveryStart.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	})} - ${deliveryEnd.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	})}`;

	return (
		<div className="min-h-screen bg-[#eef0f2] px-4 py-10">
			<div className="mx-auto max-w-3xl">
				<div className="text-center">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe2ff] text-[#1d2395]">
						<CircleCheckBig size={28} />
					</div>
					<h1 className="text-4xl font-black text-[#1a1f36]">Thank You for Your Purchase!</h1>
					<p className="mt-3 text-sm text-slate-600">
						Your order has been placed successfully. We&apos;ve sent a confirmation email to
					</p>
					<p className="mt-1 text-sm font-semibold text-[#1a1f36]">{order.checkoutData.email || 'you@example.com'}</p>
				</div>

				<div className="mt-8 grid gap-4 md:grid-cols-[1fr_1.05fr]">
					<section className="rounded-xl bg-white p-6 shadow-sm">
						<div className="grid grid-cols-2 gap-y-4 text-sm">
							<div>
								<p className="text-xs text-slate-500">Order Number</p>
								<p className="mt-1 font-bold text-[#1a1f36]">{order.orderNumber}</p>
							</div>
							<div>
								<p className="text-xs text-slate-500">Date</p>
								<p className="mt-1 font-bold text-[#1a1f36]">{orderDate}</p>
							</div>
							<div>
								<p className="text-xs text-slate-500">Total Amount</p>
								<p className="mt-1 font-bold text-[#1a1f36]">{formatCurrency(order.orderTotals.orderTotal)}</p>
							</div>
							<div>
								<p className="text-xs text-slate-500">Payment Method</p>
								<p className="mt-1 font-bold text-[#1a1f36]">
									PayHere {order.checkoutData.cardNumber?.slice(-4) || '----'}
								</p>
							</div>
						</div>

						<div className="mt-6 flex gap-3 rounded-lg bg-[#f8f9ff] p-4">
							<div className="mt-1 text-[#1d2395]">
							</div>
							
						</div>
					</section>

					<section className="rounded-xl bg-white p-4 shadow-sm">
						<div className="mb-3 flex items-center justify-between">
							<h2 className="text-sm font-bold text-[#1a1f36]">Order Summary</h2>
							<p className="text-xs text-slate-500">{order.cartItems.length} Items</p>
						</div>

						<div className="space-y-2">
							{order.cartItems.map((item) => (
								<div key={item.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-1.5">
									  <div className="h-12 w-12 rounded-md bg-linear-to-br from-slate-100 to-slate-300" />
									<div>
										<p className="text-sm font-semibold text-[#1a1f36]">{item.name}</p>
										<p className="text-xs text-slate-500">Qty {item.quantity}</p>
									</div>
									<p className="text-sm font-semibold text-slate-700">{formatCurrency(item.total)}</p>
								</div>
							))}
						</div>

						<div className="mt-2 border-t border-slate-200 pt-2">
							<div className="flex items-center justify-between">
								<p className="text-sm font-bold text-[#1a1f36]">Total Paid</p>
								<p className="text-2xl font-black text-[#1a1f36]">{formatCurrency(order.orderTotals.orderTotal)}</p>
							</div>
						</div>
					</section>
				</div>

				<div className="mt-8 flex justify-center">
					<Link
						href="/"
						className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-[#1a1f36] hover:bg-slate-100"
					>
						<ShoppingBag size={14} />
						Continue Shopping
					</Link>
				</div>

				<div className="mt-7 text-center text-xs text-slate-500">
					<p>
						Need help with your order?{' '}
						<a href="#" className="font-semibold text-[#1d2395] hover:underline">
							Contact Support
						</a>
					</p>
					<p className="mt-2 flex items-center justify-center gap-1">
						<Lock size={12} />
						All transactions are secure and encrypted.
					</p>
				</div>
			</div>
		</div>
	);
}

