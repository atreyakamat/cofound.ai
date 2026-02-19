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
  // Store step 1 values in state so they persist when step 2 renders
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    companyName: "", industry: "", stage: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      toast.success("Welcome to CofounderAI!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="text-center mb-8">
        <span className="text-4xl">🧠</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-gray-600">Start making better decisions today</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
        {step === 1 && (
          <form onSubmit={goToStep2} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required className="input-field" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required className="input-field" placeholder="you@startup.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required minLength={6} className="input-field" placeholder="At least 6 characters" />
            </div>
            <button type="submit" className="btn-primary w-full">Continue →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-500">Optional — helps CofounderAI give better advice</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} className="input-field" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <input value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} className="input-field" placeholder="SaaS, E-commerce, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
              <select value={formData.stage} onChange={(e) => handleChange("stage", e.target.value)} className="input-field">
                <option value="">Select stage...</option>
                {stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500">Sign in</Link>
      </p>
    </div>
  );
}
