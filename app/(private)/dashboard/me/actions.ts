"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";

export async function updateMyProfile(
  name: string,
  email: string,
  currentPassword?: string,
  newPassword?: string
) {
  try {

    const currentUser = await requireUser();

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

    if (newPassword && (newPassword.length < 8 || newPassword.length > 128)) {
      return {
        success: false,
        error: "Nova senha deve ter entre 8 e 128 caracteres",
      };
    }

    if (newPassword && !currentPassword) {
      return {
        success: false,
        error: "Senha atual é obrigatória para alterar a senha",
      };
    }

    // Sanitizar inputs
    const sanitizedName = sanitizeText(name, 200);
    const sanitizedEmail = email.trim().toLowerCase();

    // Verificar se o email já está em uso por outro usuário
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
        id: {
          not: currentUser.id,
        },
      },
    });

    if (emailInUse) {
      return {
        success: false,
        error: "Este email já está em uso por outro usuário",
      };
    }

    // Atualizar usuário diretamente no Prisma
    try {
      const updateData: {
        name: string;
        email: string;
      } = {
        name: sanitizedName,
        email: sanitizedEmail,
      };

      await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData,
      });

      // Atualizar senha via better-auth se fornecida
      if (newPassword && currentPassword) {
        try {
          await auth.api.changePassword({
            body: {
              newPassword: newPassword,
              currentPassword: currentPassword,
              revokeOtherSessions: true,
            },
            headers: await headers(),
          });
        } catch (passwordError) {
          const errorId = `pwd-update-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
          logger.error(
            "Error updating password",
            { errorId, userId: currentUser.id },
            passwordError as Error
          );
          return {
            success: false,
            error: `Erro ao atualizar senha. Verifique se a senha atual está correta.`,
          };
        }
      }

      revalidatePath("/dashboard/me");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (error: unknown) {
      const errorId = `profile-update-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      logger.error(
        "Error updating profile (inner)",
        { errorId, userId: currentUser.id },
        error as Error
      );
      return {
        success: false,
        error: `Erro ao atualizar perfil. ID do erro: ${errorId}`,
      };
    }
  } catch (error) {
    const errorId = `profile-update-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error("Error updating profile", { errorId }, error as Error);
    return {
      success: false,
      error: `Erro ao atualizar perfil. ID do erro: ${errorId}`,
    };
  }
}
