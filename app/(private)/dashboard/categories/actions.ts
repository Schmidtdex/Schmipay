"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";
import { validateCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";

export async function createCategory(name: string) {
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

    // Validações
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        success: false,
        error: "Nome da categoria é obrigatório",
      };
    }

    if (name.trim().length > 100) {
      return {
        success: false,
        error: "Nome da categoria muito longo (máximo 100 caracteres)",
      };
    }

    // Sanitizar input
    const sanitizedName = sanitizeText(name, 100);

    // Verificar se a categoria já existe para este usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        createdById: user.id,
        name: {
          equals: sanitizedName,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Uma categoria com esse nome já existe",
      };
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        name: sanitizedName,
        createdById: user.id,
      },
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard");
    return { success: true, data: category };
  } catch (error) {
    const errorId = `cat-create-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error("Error creating category", { errorId }, error as Error);
    return {
      success: false,
      error: `Erro ao criar categoria. ID do erro: ${errorId}`,
    };
  }
}

export async function deleteCategory(categoryId: string) {
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

    if (
      !categoryId ||
      typeof categoryId !== "string" ||
      categoryId.trim().length === 0
    ) {
      return {
        success: false,
        error: "ID da categoria é obrigatório",
      };
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        transactions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Categoria não encontrada",
      };
    }

    if (category.createdById !== user.id) {
      return {
        success: false,
        error: "Você não tem permissão para deletar esta categoria",
      };
    }

    if (category.transactions.length > 0) {
      return {
        success: false,
        error:
          "Não é possível deletar uma categoria que possui transações vinculadas",
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const errorId = `cat-delete-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error deleting category",
      { errorId, categoryId },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao deletar categoria. ID do erro: ${errorId}`,
    };
  }
}
