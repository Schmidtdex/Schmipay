"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";
import { requireAdmin } from "@/app/(data)/users/require-admin";
import { validateCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";
import { isValidEmail } from "@/lib/validation";

export async function createTransaction(
  type: "INCOME" | "EXPENSE",
  amount: number,
  categoryId: string,
  description?: string
) {
  let userId = "unknown";
  try {
    // Validação CSRF
    const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return {
        success: false,
        error: "Requisição inválida. Por favor, recarregue a página.",
      };
    }

    const user = await requireUser();
    userId = user.id;

    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: "O valor deve ser maior que zero" };
    }

    // Rejeitar notação científica
    if (amount.toString().toLowerCase().includes("e")) {
      return {
        success: false,
        error: "Notação científica não é permitida. Use apenas números",
      };
    }

    // Verificar se o valor não é Infinity ou muito grande
    if (!isFinite(amount) || amount > 999999999.99) {
      return { success: false, error: "Valor muito alto" };
    }

    if (
      !categoryId ||
      typeof categoryId !== "string" ||
      categoryId.trim().length === 0
    ) {
      return { success: false, error: "Categoria é obrigatória" };
    }

    const sanitizedDescription = description
      ? sanitizeText(description, 200)
      : undefined;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        createdById: user.id, // Garantir que a categoria pertence ao usuário
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Categoria não encontrada ou não pertence a você",
      };
    }

    // Validar saldo disponível para saques (EXPENSE)
    if (type === "EXPENSE") {
      // Usar query agregada para melhor performance
      const saldoResult = await prisma.$queryRaw<Array<{ saldo: number }>>`
        SELECT 
          COALESCE(
            SUM(CASE 
              WHEN type = 'INCOME' THEN amount 
              WHEN type = 'EXPENSE' THEN -amount 
              ELSE 0 
            END),
            0
          )::numeric as saldo
        FROM "Transaction"
        WHERE "createdById" = ${user.id}::text 
          AND status = 'APPROVED'
      `;

      const saldoAtual = saldoResult[0]?.saldo
        ? Number(saldoResult[0].saldo)
        : 0;

      // Verificar se há saldo suficiente para o saque
      if (saldoAtual < amount) {
        const saldoFormatado = saldoAtual.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        return {
          success: false,
          error: `Saldo insuficiente. Saldo disponível: ${saldoFormatado}`,
        };
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        description: sanitizedDescription || null,
        categoryId,
        createdById: user.id,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard");
    // Converter Decimal para number para serialização
    return {
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
      },
    };
  } catch (error) {
    const errorId = `tx-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error creating transaction",
      { errorId, userId },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao criar transação. ID do erro: ${errorId}`,
    };
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  try {
    // Validação CSRF
    const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return {
        success: false,
        error: "Requisição inválida. Por favor, recarregue a página.",
      };
    }

    await requireAdmin();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        success: false,
        error: "Nome é obrigatório",
      };
    }

    if (name.trim().length > 200) {
      return {
        success: false,
        error: "Nome muito longo",
      };
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return {
        success: false,
        error: "Email inválido",
      };
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return {
        success: false,
        error: "Senha deve ter pelo menos 8 caracteres",
      };
    }

    if (password.length > 128) {
      return {
        success: false,
        error: "Senha muito longa",
      };
    }

    const sanitizedName = sanitizeText(name, 200);
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      await auth.api.createUser({
        body: {
          name: sanitizedName,
          email: sanitizedEmail,
          password,
        },
      });

      revalidatePath("/dashboard");
      return { success: true };
    } catch (error: unknown) {
      const errorId = `user-create-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      logger.error(
        "Error creating user via better-auth",
        { errorId, email: sanitizedEmail },
        error as Error
      );
      return {
        success: false,
        error: `Erro ao criar usuário. ID do erro: ${errorId}`,
      };
    }
  } catch (error) {
    const errorId = `user-create-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error("Error creating user", { errorId }, error as Error);
    return {
      success: false,
      error: `Erro ao criar usuário. ID do erro: ${errorId}`,
    };
  }
}

export async function updateTransactionStatus(
  transactionId: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    // Validação CSRF
    const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return {
        success: false,
        error: "Requisição inválida. Por favor, recarregue a página.",
      };
    }

    await requireAdmin();

    if (
      !transactionId ||
      typeof transactionId !== "string" ||
      transactionId.trim().length === 0
    ) {
      return {
        success: false,
        error: "ID da transação é obrigatório",
      };
    }

    if (status !== "APPROVED" && status !== "REJECTED") {
      return {
        success: false,
        error: "Status inválido",
      };
    }

    // Verificar se a transação existe e está pendente
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return {
        success: false,
        error: "Transação não encontrada",
      };
    }

    if (transaction.status !== "PENDING") {
      return {
        success: false,
        error: "Apenas transações pendentes podem ser aprovadas ou rejeitadas",
      };
    }

    // Atualizar status da transação
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    const errorId = `tx-status-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error updating transaction status",
      { errorId, transactionId, status },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao atualizar status da transação. ID do erro: ${errorId}`,
    };
  }
}
