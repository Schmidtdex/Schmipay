import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getTransactions() {
await requireUser();

  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    status: transaction.status,
    amount: Number(transaction.amount),
    description: transaction.description || "",
    createdAt: transaction.createdAt,
    category: transaction.category.name,
    createdBy: transaction.createdBy.name,
  }));
}
