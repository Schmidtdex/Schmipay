"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "../users/require-user";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";
import { z } from "zod";

const PaymentPlanSchema = z.object({
  name: z.string().min(1).max(200),
  supplier: z.string().max(200).optional().or(z.literal("")),
  event: z.string().max(200).optional().or(z.literal("")),
  value: z.number().positive(),
  dueDate: z
    .string()
    .min(1, "A data de vencimento é obrigatória")
    .transform((val) => new Date(val)),
  responsible: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).default("PENDING"),
});


export async function createPaymentPlan(formData: FormData) {
  let userId = "unknown";
  const path = "/planejamento";

  try {

    const user = await requireUser();
    userId = user.id;

const rawData = {
  name: formData.get("name"),
  supplier: formData.get("supplier"),
  event: formData.get("event"),
  value: Number(formData.get("value")),
  dueDate: formData.get("dueDate"),
  responsible: formData.get("responsible"),
  status: formData.get("status") || "PENDING",
};


    const validateData = PaymentPlanSchema.safeParse(rawData);

    if (!validateData.success) {
      return {
        success: false,
        error: validateData.error.issues[0].message,
      };
    }

    const { name, supplier, event, value, dueDate, responsible, status } =
      validateData.data;

    const paymentPlan = await prisma.paymentPlan.create({
      data: {
        name: sanitizeText(name, 200),
        supplier: supplier ? sanitizeText(supplier, 200) : null,
        event: event ? sanitizeText(event, 100) : null,
        value,
        dueDate: new Date(dueDate),
        responsible: responsible ? sanitizeText(responsible, 100) : null,
        status,
        createdById: user.id,
      },
    });

    revalidatePath(path);
    return {
      success: true,
      data: {
        ...paymentPlan,
        value: Number(paymentPlan.value),
      },
    };
  } catch (error) {
    const errorId = `plan-create-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error creating payment plan",
      { errorId, userId },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao criar plano de pagamento. ID do erro: ${errorId}`,
    };
  }
}

export async function getPaymentPlans() {
  try {
    const user = await requireUser();

    const plans = await prisma.paymentPlan.findMany({
      where: {
        createdById: user.id,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return plans.map((plan) => ({
      ...plan,
      value: Number(plan.value),
    }));
  } catch (error) {
    logger.error("Error fetching payment plans", {}, error as Error);
    return [];
  }
}

export async function updatePaymentPlanStatus(
  id: string,
  status: "PENDING" | "PAID" | "OVERDUE"
) {
  let userId = "unknown";
  const path = "/planejamento";

  try {
    const user = await requireUser();
    userId = user.id;

    if (!id || !["PENDING", "PAID", "OVERDUE"].includes(status)) {
      return { success: false, error: "Dados inválidos." };
    }

    const updatedPlan = await prisma.paymentPlan.update({
      where: { id, createdById: user.id },
      data: { status },
    });

    revalidatePath(path);
    return { success: true, data: updatedPlan };
  } catch (error) {
    const errorId = `plan-update-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error updating payment plan status",
      { errorId, userId, id },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao atualizar status. ID do erro: ${errorId}`,
    };
  }
}

export async function updatePaymentPlan(id: string, formData: FormData) {
  let userId = "unknown";
  const path = "/planejamento";

  try {

    const user = await requireUser();
    userId = user.id;

    if (!id) {
      return { success: false, error: "ID do plano de pagamento é obrigatório." };
    }

    const existingPlan = await prisma.paymentPlan.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.createdById !== user.id) {
      return {
        success: false,
        error: "Acesso negado.",
      };
    }

    const rawData = {
  name: formData.get("name"),
  supplier: formData.get("supplier"),
  event: formData.get("event"),
  value: Number(formData.get("value")),
  dueDate: formData.get("dueDate"),
  responsible: formData.get("responsible"),
  status: formData.get("status") ?? "PENDING",
};

    const validateData = PaymentPlanSchema.safeParse(rawData);

    if (!validateData.success) {
      return {
        success: false,
        error: validateData.error.issues[0].message,
      };
    }

    const { name, supplier, event, value, dueDate, responsible, status } =
      validateData.data;

    const updatedPlan = await prisma.paymentPlan.update({
      where: { id },
      data: {
        name: sanitizeText(name, 200),
        supplier: supplier ? sanitizeText(supplier, 200) : null,
        event: event ? sanitizeText(event, 100) : null,
        value,
        dueDate: new Date(dueDate),
        responsible: responsible ? sanitizeText(responsible, 100) : null,
        status,
      },
    });

    revalidatePath(path);
    return {
      success: true,
      data: {
        ...updatedPlan,
        value: Number(updatedPlan.value),
      },
    };
  } catch (error) {
    const errorId = `plan-update-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error updating payment plan",
      { errorId, userId, id },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao atualizar plano. ID do erro: ${errorId}`,
    };
  }
}

export async function deletePaymentPlan(id: string) {
  let userId = "unknown";
  const path = "/planning";

  try {
    const user = await requireUser();
    userId = user.id;

    if (!id) {
      return { success: false, error: "ID do plano de pagamento é obrigatório." };
    }

    const existingPlan = await prisma.paymentPlan.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.createdById !== user.id) {
      return {
        success: false,
        error: "Você não tem permissão para deletar este plano",
      };
    }

    await prisma.paymentPlan.delete({
      where: { id },
    });

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    const errorId = `plan-delete-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    logger.error(
      "Error deleting payment plan",
      { errorId, userId, id },
      error as Error
    );
    return {
      success: false,
      error: `Erro ao deletar plano. ID do erro: ${errorId}`,
    };
  }
}