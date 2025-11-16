import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getCategories() {
  // Verificar se o usuário está autenticado
  await requireUser();

  try {
    const categories = await prisma.category.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching categories:", error);
    }
    return { success: false, error: "Erro ao buscar categorias" };
  }
}
