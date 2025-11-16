"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function useSignOut() {
  const router = useRouter();
  const handleSignout = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
          toast.success("Logout realizado com sucesso");
        },
        onError: () => {
          toast.error("Falha ao fazer logout");
        },
      },
    });
  };

  return handleSignout;
}
