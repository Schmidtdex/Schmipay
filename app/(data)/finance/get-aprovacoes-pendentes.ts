import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getAprovacoesPendentes() {
  await requireUser();

  const result = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  return result.length;
}
