"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const stages = [
  { value: "idea", label: "Idea Stage" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "growth", label: "Growth" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      companyName: formData.get("companyName") as string,
      industry: formData.get("industry") as string,
      stage: formData.get("stage") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      // Auto sign in
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Welcome to CofounderAI!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="text-center mb-8">
        <span className="text-4xl">🧠</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-gray-600">
          Start making better decisions today
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 space-y-5"
      >
        {step === 1 && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input id="name" name="name" required className="input-field" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input id="email" name="email" type="email" required className="input-field" placeholder="you@startup.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input id="password" name="password" type="password" required minLength={6} className="input-field" placeholder="At least 6 characters" />
            </div>
            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-500">Optional — helps CofounderAI give better advice</p>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Company Name
              </label>
              <input id="companyName" name="companyName" className="input-field" placeholder="Acme Inc." />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                Industry
              </label>
              <input id="industry" name="industry" className="input-field" placeholder="SaaS, E-commerce, etc." />
            </div>
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1.5">
                Stage
              </label>
              <select id="stage" name="stage" className="input-field">
                <option value="">Select stage...</option>
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                ← Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
