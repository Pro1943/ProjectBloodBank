import { currentUser } from "@clerk/nextjs/server";

export type UserRole = "hospital_admin" | "donor";

export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const role = user.publicMetadata.role as string;
  if (role === "hospital_admin" || role === "donor") {
    return role;
  }
  return null;
}

export async function checkUserRole(expectedRole: UserRole): Promise<boolean> {
  const role = await getUserRole();
  return role === expectedRole;
}
