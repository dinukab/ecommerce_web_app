'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function OrderInvoiceButton({ orderId }: { orderId: string }) {
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSendInvoice() {
    setIsSending(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to send invoices.');
        return;
      }

      const res = await api.sendInvoice(token, orderId);
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(res.message || "Failed to send invoice.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong while sending the email.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <button 
      onClick={handleSendInvoice}
      disabled={isSending || success}
      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
        isSending || success 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed shadow-none' 
          : 'bg-gray-100 text-black hover:bg-gray-300 border-gray-300 border-1'
      }`}
    >
      {success ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
      {isSending ? 'Sending...' : success ? 'Invoice Sent!' : 'Email My Invoice'}
    </button>
  );
}
