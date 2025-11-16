import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/(data)/users/require-admin";

export async function getUsers() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: users };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching users:", error);
    }
    return { success: false, error: "Erro ao buscar usuários" };
  }
}
