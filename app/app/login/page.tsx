"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoState } from "@/lib/demo/hooks";
import { loginResidentByPhone, normalizePhone } from "@/lib/demo/store";

const DEMO_OTP = "1234";

export default function ResidentLoginPage() {
  const router = useRouter();
  const state = useDemoState();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");

  const greenResidents = useMemo(
    () =>
      state.residents
        .filter((r) => r.societyId === "soc_green")
        .map((r) => {
          const flat = state.flats.find((f) => f.id === r.flatId);
          return { ...r, flatNumber: flat?.number ?? "" };
        })
        .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber)),
    [state.residents, state.flats],
  );

  const matched = state.residents.find(
    (r) => normalizePhone(r.phone) === normalizePhone(phone),
  );

  const sendOtp = () => {
    setError("");
    const digits = normalizePhone(phone);
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    const found = state.residents.find(
      (r) => normalizePhone(r.phone) === digits,
    );
    if (!found) {
      setError("No resident with this phone. Ask committee to invite you.");
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
    const result = loginResidentByPhone(phone, inviteCode || undefined);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/app");
  };

  return (
    <div className="space-y-4 p-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Resident login
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Login with mobile number
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Same phone the secretary saved when inviting you. Demo OTP:{" "}
          <strong>{DEMO_OTP}</strong>
        </p>

        {step === "phone" ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
            <label className="block text-sm">
              Mobile number
              <input
                inputMode="numeric"
                autoComplete="tel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg tracking-wide"
                placeholder="10-digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-medium text-white"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              verifyAndEnter();
            }}
          >
            <p className="text-sm text-slate-600">
              OTP sent to <strong>{normalizePhone(phone)}</strong>
              {matched ? ` · ${matched.name}` : ""}
            </p>
            <label className="block text-sm">
              OTP
              <input
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg tracking-[0.3em]"
                placeholder={DEMO_OTP}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
            </label>
            {matched?.inviteCode ? (
              <label className="block text-sm">
                Invite code (from committee)
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-mono text-sm uppercase"
                  placeholder="CHS-XXXXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </label>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 text-sm font-medium text-white"
            >
              Verify & open home
            </button>
            <button
              type="button"
              className="w-full text-sm text-slate-500 underline"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
            >
              Change number
            </button>
          </form>
        )}

        {error ? (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-slate-900">
          Quick pick (Green Park demo)
        </p>
        <ul className="space-y-2">
          {greenResidents.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-left text-sm hover:bg-teal-50"
                onClick={() => {
                  setPhone(r.phone);
                  setStep("phone");
                  setError("");
                  setInviteCode("");
                }}
              >
                <span>
                  <strong>{r.name}</strong>
                  <span className="text-slate-500"> · {r.flatNumber}</span>
                </span>
                <span className="font-mono text-xs text-teal-800">{r.phone}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Hero overdue: Neha Kapoor · B-101 · 9000002101
        </p>
      </div>
    </div>
  );
}
