import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const requireAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
};
