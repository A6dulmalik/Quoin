"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../lib/auth";

const STELLAR_KEY = /^G[A-Z0-9]{55}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[A-Za-z0-9_]{3,32}$/;

type Fields = { username: string; email: string; publicKey: string };
type Errors = Partial<Record<keyof Fields, string>>;

/** Pure validation so every rule lives in one place. Mirrors the backend DTO for publicKey. */
function validate({ username, email, publicKey }: Fields): Errors {
  const errors: Errors = {};
  if (!username.trim()) errors.username = "Username is required.";
  else if (!USERNAME.test(username.trim()))
    errors.username = "Use 3-32 letters, numbers or underscores.";

  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address.";

  if (!publicKey.trim()) errors.publicKey = "Stellar public key is required.";
  else if (!STELLAR_KEY.test(publicKey.trim()))
    errors.publicKey =
      "Must start with G and be 56 characters (letters A-Z and digits).";
  return errors;
}

export default function RegisterPage() {
  const [values, setValues] = useState<Fields>({
    username: "",
    email: "",
    publicKey: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [nonceMessage, setNonceMessage] = useState<string | null>(null);

  const update = (key: keyof Fields, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key: keyof Fields) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    const found = validate(values);
    setErrors(found);
    setTouched({ username: true, email: true, publicKey: true });
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: values.publicKey.trim() }),
      });
      const body = (await res.json()) as {
        message?: string;
        data?: { message?: string; nonce?: string };
      };
      if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
      setNonceMessage(body.data?.message ?? body.data?.nonce ?? "Nonce issued.");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields: { key: keyof Fields; label: string; type: string; placeholder: string }[] = [
    { key: "username", label: "Username", type: "text", placeholder: "satoshi_01" },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { key: "publicKey", label: "Stellar public key", type: "text", placeholder: "G..." },
  ];

  return (
    <main className="min-h-screen bg-[#02030a] px-4 py-12 text-white sm:px-6 lg:px-8">
      <Navbar />
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl border border-white/10 bg-black/20 px-6 py-8"
        >
          {fields.map(({ key, label, type, placeholder }) => {
            const message = touched[key] ? errors[key] : undefined;
            return (
              <div key={key} className="mb-5">
                <label htmlFor={key} className="text-sm font-medium">
                  {label}
                </label>
                <input
                  id={key}
                  name={key}
                  type={type}
                  value={values[key]}
                  placeholder={placeholder}
                  autoComplete={key === "email" ? "email" : "off"}
                  aria-invalid={message ? true : undefined}
                  aria-describedby={message ? `${key}-error` : undefined}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => blur(key)}
                  className={`mt-2 w-full rounded-2xl border bg-black/50 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400/40 ${
                    message ? "border-red-500/60" : "border-white/10"
                  }`}
                />
                {message && (
                  <p id={`${key}-error`} role="alert" className="mt-1 text-xs text-red-300">
                    {message}
                  </p>
                )}
              </div>
            );
          })}

          {serverError && (
            <p role="alert" className="mb-4 text-sm text-red-300">
              {serverError}
            </p>
          )}
          {nonceMessage && (
            <p className="mb-4 break-words text-sm text-cyan-200">
              Wallet check issued. Sign this message with your wallet to finish: {nonceMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
