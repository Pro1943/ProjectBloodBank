import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function AuthRedirectPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user has a hospital profile
  const hospital = await db.hospital.findUnique({
    where: { clerkUserId: user.id },
  });

  if (hospital) {
    redirect("/dashboard");
  }

  // Check if user has a donor profile
  const donor = await db.donor.findUnique({
    where: { clerkUserId: user.id },
  });

  if (donor) {
    redirect("/donor");
  }

  // No profile yet, go to onboarding selection
  redirect("/onboarding");
}
