"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );

  // Get amount from URL parameter
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  // Demo transaction ID (static for demo)
  const txnId = "TXN123456789";

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-8">
      {/* Success Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Payment Successful</h2>
        <p className="mt-2 text-3xl font-bold text-teal-600">{formatINR(amount)}</p>
        <p className="mt-1 text-sm text-slate-500">
          Paid on 10 Nov 2025, 11:24 AM
        </p>
      </div>

      {/* Transaction Details */}
      <div className="w-full rounded-2xl bg-white p-4 shadow-sm">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono font-medium text-slate-900">{txnId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paid by</span>
            <span className="font-medium text-slate-900">{resident?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-medium text-slate-900">UPI</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 w-full space-y-3">
        <button
          type="button"
          className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={() => window.print()}
        >
          View Receipt
        </button>
        <Link
          href="/app/bill"
          className="block w-full rounded-xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View Bill
        </Link>
        <Link
          href="/app"
          className="block w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
