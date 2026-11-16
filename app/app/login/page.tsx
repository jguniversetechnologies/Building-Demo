"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemoState } from "@/lib/demo/hooks";
import { loginResidentByPhone, normalizePhone } from "@/lib/demo/store";

const DEMO_OTP = "1234";

export default function ResidentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useDemoState();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");

  const societySlug = searchParams.get("society") ?? "green-park";
  const society =
    state.societies.find((s) => s.slug === societySlug) ??
    state.societies.find((s) => s.slug === "green-park") ??
    state.societies[0] ??
    null;

  useEffect(() => {
    const fromQuery = searchParams.get("phone");
    if (!fromQuery) return;
    setPhone(fromQuery);
    setStep("phone");
    setError("");
  }, [searchParams]);

  const quickPickResidents = useMemo(() => {
    if (!society) return [];
    return state.residents
      .filter((r) => r.societyId === society.id)
      .map((r) => {
        const flat = state.flats.find((f) => f.id === r.flatId);
        return {
          ...r,
          flatNumber: flat?.number ?? "",
        };
      })
      .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber));
  }, [society, state.residents, state.flats]);

  const matched = quickPickResidents.find(
    (r) => normalizePhone(r.phone) === normalizePhone(phone),
  );

  const sendOtp = () => {
    setError("");
    const digits = normalizePhone(phone);
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    const found = quickPickResidents.find(
      (r) => normalizePhone(r.phone) === digits,
    );
    if (!found) {
      setError(
        society
          ? `No resident with this phone in ${society.name}.`
          : "No resident with this phone. Ask committee to invite you.",
      );
      return;
    }
    setStep("otp");
    setOtp("");
  };

  const verifyAndEnter = () => {
    setError("");
    if (otp.trim() !== DEMO_OTP) {
      setError(`Demo OTP is ${DEMO_OTP}`);
      return;
    }
    if (!matched) {
      setError(
        society
          ? `No resident with this phone in ${society.name}.`
          : "No resident with this phone.",
      );
      return;
    }
    const result = loginResidentByPhone(phone);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/app");
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-8">
      {/* Logo/Brand */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Society Shastra</h1>
        <p className="text-sm text-slate-500">
          {society ? `${society.name} · Resident login` : "Welcome back"}
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full rounded-2xl bg-white p-6 shadow-lg">
        {step === "phone" ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mobile Number / Email
              </label>
              <input
                inputMode="numeric"
                autoComplete="tel"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
            >
              Login
            </button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verifyAndEnter();
            }}
          >
            <div className="mb-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
              <p className="font-medium">OTP sent to {normalizePhone(phone)}</p>
              {matched && <p className="text-teal-600">{matched.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Enter OTP
              </label>
              <input
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.3em] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder={DEMO_OTP}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-500">Demo OTP: {DEMO_OTP}</p>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
            >
              Verify & Login
            </button>
            <button
              type="button"
              className="w-full text-sm text-teal-600 hover:text-teal-700"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
            >
              ← Change number
            </button>
          </form>
        )}

        {error ? (
          <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-teal-600 hover:text-teal-700"
            onClick={() => setError("Contact committee for password reset")}
          >
            Forgot Password?
          </button>
          <button
            type="button"
            className="text-teal-600 hover:text-teal-700"
            onClick={() => setError("Contact committee to register")}
          >
            Register
          </button>
        </div>
      </div>

      {/* Quick Pick — residents for this society only */}
      <div className="mt-6 w-full rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          Quick Pick ({society?.name ?? "Society"} residents)
        </p>
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {quickPickResidents.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 px-4 py-2.5 text-left text-sm transition hover:border-teal-200 hover:bg-teal-50"
                onClick={() => {
                  setPhone(r.phone);
                  setStep("phone");
                  setError("");
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      {r.flatNumber || "—"}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-teal-800">{r.phone}</span>
              </button>
            </li>
          ))}
          {quickPickResidents.length === 0 ? (
            <li className="text-sm text-slate-500">
              No residents in this society yet.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
