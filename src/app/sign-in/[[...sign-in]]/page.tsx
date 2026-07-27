"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/auth/redirect");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between border-r border-[#E2E8F0] bg-white p-10 lg:flex">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B91C1C]">
              <span className="text-sm font-bold text-white">BB</span>
            </div>
            <span className="font-bold text-[#0F172A]">Project Blood Bank</span>
          </div>
          <div className="mt-12">
            <div className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-[#B91C1C]">
              Secure access
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[#0F172A]">Welcome back.</h1>
            <p className="mt-3 text-[#64748B]">
              Sign in to access your coordination workspace — whether you manage a hospital or donate blood.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            {[
              { icon: "🔒", text: "Secured with end-to-end encryption" },
              { icon: "🏥", text: "Role-based access for hospitals and donors" },
              { icon: "⚡", text: "Real-time emergency coordination" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-[#64748B]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#94A3B8]">© {new Date().getFullYear()} Project Blood Bank</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2 justify-center mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B91C1C]">
                <span className="text-xs font-bold text-white">BB</span>
              </div>
              <span className="text-sm font-bold text-[#0F172A]">Project Blood Bank</span>
            </div>
            <h1 className="text-center text-2xl font-bold text-[#0F172A]">Sign in</h1>
          </div>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/auth/redirect" />
        </div>
      </div>
    </div>
  );
}
