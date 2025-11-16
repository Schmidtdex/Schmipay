import "server-only";

import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getSaidasDoMes() {
await requireUser();

  const now = new Date();

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "EXPENSE",
      status: "APPROVED",
      createdAt: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
  });

  return Number(result._sum.amount ?? 0);
}
