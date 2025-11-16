import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getPendingCount() {
  const user = await requireUser();

  // Se for admin, retorna todas as transações pendentes
  if (user.role === "admin") {
    const count = await prisma.transaction.count({
      where: {
        status: "PENDING",
      },
    });
    return count;
  }

  // Caso contrário, retorna apenas as do usuário
  const count = await prisma.transaction.count({
    where: {
      createdById: user.id,
      status: "PENDING",
    },
  });

  return count;
}
