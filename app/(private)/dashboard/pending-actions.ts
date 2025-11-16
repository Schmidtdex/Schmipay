"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/(data)/users/require-admin";
import { logger } from "@/lib/logger";

export async function getPendingTransactionsAction() {
  try {
    await requireAdmin();

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
    const errorId = `tx-pending-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error fetching pending transactions",
      { errorId },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao buscar transações pendentes. ID do erro: ${errorId}`,
    };
  }
}
