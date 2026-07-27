"use client";
import Link from "next/link";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";

export default function HeaderClient() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center gap-2">
      {isSignedIn ? (
        <div className="flex items-center gap-2">
          <UserButton />
          <SignOutButton>
            <button className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]">
              Sign out
            </button>
          </SignOutButton>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#B91C1C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#991B1B]"
          >
            Sign up
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
