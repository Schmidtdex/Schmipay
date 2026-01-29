"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/(data)/users/require-admin";
import { requireUser } from "@/app/(data)/users/require-user";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";
import { isValidEmail } from "@/lib/validation";

export async function updateUser(
  userId: string,
  name: string,
  email: string,
  password?: string,
  role?: "user" | "admin"
) {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return {
        success: false,
        error: "ID do usuário é obrigatório",
      };
    }

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

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return {
        success: false,
        error: "Email inválido",
      };
    }

    if (password && (password.length < 8 || password.length > 128)) {
      return {
        success: false,
        error: "Senha deve ter entre 8 e 128 caracteres",
      };
    }

    // Sanitizar inputs
    const sanitizedName = sanitizeText(name, 200);
    const sanitizedEmail = email.trim().toLowerCase();

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Verificar se o email já está em uso por outro usuário
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
        id: {
          not: userId,
        },
      },
    });

    if (emailInUse) {
      return {
        success: false,
        error: "Este email já está em uso por outro usuário",
      };
    }

    // Validar role se fornecida
    if (role && role !== "user" && role !== "admin") {
      return {
        success: false,
        error: "Função inválida. Deve ser user ou admin",
      };
    }

    // Atualizar usuário diretamente no Prisma
    try {
      const updateData: {
        name: string;
        email: string;
        role?: "user" | "admin";
      } = {
        name: sanitizedName,
        email: sanitizedEmail,
      };

      if (role) {
        updateData.role = role;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Atualizar senha via better-auth se fornecida
      if (password) {
        try {
          await auth.api.setUserPassword({
            body: {
              newPassword: password,
              userId: userId,
            },
            headers: await headers(),
          });
        } catch (passwordError) {
          const errorId = `pwd-update-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
          logger.error(
            "Error updating password",
            { errorId, userId },
            passwordError as Error
          );
          return {
            success: false,
            error: `Erro ao atualizar senha. ID do erro: ${errorId}`,
          };
        }
      }

      revalidatePath("/dashboard/users");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (error: unknown) {
      const errorId = `user-update-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      logger.error(
        "Error updating user (inner)",
        { errorId, userId },
        error as Error
      );
      return {
        success: false,
        error: `Erro ao atualizar usuário. ID do erro: ${errorId}`,
      };
    }
  } catch (error) {
    const errorId = `user-update-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error("Error updating user", { errorId, userId }, error as Error);
    return {
      success: false,
      error: `Erro ao atualizar usuário. ID do erro: ${errorId}`,
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return {
        success: false,
        error: "ID do usuário é obrigatório",
      };
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Deletar usuário via better-auth
    try {
      await auth.api.removeUser({
        body: {
          userId: userId,
        },
        headers: await headers(),
      });

      revalidatePath("/dashboard/users");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (error: unknown) {
      const errorId = `user-delete-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      logger.error(
        "Error deleting user (inner)",
        { errorId, userId },
        error as Error
      );
      return {
        success: false,
        error: `Erro ao deletar usuário. ID do erro: ${errorId}`,
      };
    }
  } catch (error) {
    const errorId = `user-delete-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error("Error deleting user", { errorId, userId }, error as Error);
    return {
      success: false,
      error: `Erro ao deletar usuário. ID do erro: ${errorId}`,
    };
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role?: "user" | "admin"
) {
  try {

    // Verificar se o usuário é admin antes de chamar requireAdmin (que faz redirect)
    const currentUser = await requireUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Você não tem permissão para criar usuário",
      };
    }

    await requireAdmin();

    // Validações
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        success: false,
        error: "Nome é obrigatório",
      };
    }

    if (name.trim().length > 200) {
      return {
        success: false,
        error: "Nome muito longo (máximo 200 caracteres)",
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
        error: "Senha muito longa (máximo 128 caracteres)",
      };
    }

    // Sanitizar inputs
    const sanitizedName = sanitizeText(name, 200);
    const sanitizedEmail = email.trim().toLowerCase();

    // Verificar se o email já está em uso
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
      },
    });

    if (emailInUse) {
      return {
        success: false,
        error: "Este email já está em uso",
      };
    }

    // Validar role se fornecida
    if (role && role !== "user" && role !== "admin") {
      return {
        success: false,
        error: "Função inválida. Deve ser user ou admin",
      };
    }

    // Criar usuário via better-auth
    try {
      await auth.api.createUser({
        body: {
          name: sanitizedName,
          email: sanitizedEmail,
          password: password,
        },
      });

      // Atualizar role diretamente no Prisma após criar o usuário
      if (role) {
        const createdUser = await prisma.user.findUnique({
          where: { email: sanitizedEmail },
        });

        if (createdUser) {
          await prisma.user.update({
            where: { id: createdUser.id },
            data: { role },
          });
        }
      }

      revalidatePath("/dashboard/users");
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
