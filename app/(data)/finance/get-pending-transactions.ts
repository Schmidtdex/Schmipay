import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/(data)/users/require-admin";

export async function getPendingTransactions() {
  await requireAdmin();

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description || "",
        createdAt: transaction.createdAt,
        category: transaction.category.name,
        createdBy: transaction.createdBy.name,
        createdByEmail: transaction.createdBy.email,
      })),
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching pending transactions:", error);
    }
    return { success: false, error: "Erro ao buscar transações pendentes" };
  }
}
