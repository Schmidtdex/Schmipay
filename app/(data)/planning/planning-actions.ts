"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "../users/require-user";
import { validateCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";
import { sanitizeText } from "@/lib/sanitize";
import { z } from "zod";



async function uploadToCloudinary(file:File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "seu_preset");

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
            {
                method: "POST",
                body: formData,
    }
        );
        if (!response.ok) {
            throw new Error("Failed to upload image to Cloudinary");
}

const data = await response.json();
return data.secure_url;
    } catch (uploadError) {
            logger.error("Cloudinary upload error", {}, uploadError as Error);
        throw new Error("Erro ao enviar arquivo para o Cloudinary");
    }
}



const PaymentPlanSchema = z.object({
    name: z.string().min(1, "O nome do pagamento é obrigatório").max(200),
    supplier: z.string().max(200).optional().or(z.literal("")),
    event: z.string().max(200).optional().or(z.literal("")),
    value: z.number().positive("O valor deve ser positivo"),
    dueDate: z.string().date("A data de vencimento é inválida"),
    responsible: z.string().max(100).optional().or(z.literal("")),
    status: z.enum(["PENDING", "PAID", "OVERDUE"]).default("PENDING"),
    proofFile: z.instanceof(File).optional(),
});

type PaymentPlanInput = z.infer<typeof PaymentPlanSchema>;


export async function createPaymentPlan(formData: FormData) { 
    let userId = "unknown";
    const path = "/planejamento";
    try {
  const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return {
        success: false,
        error: "Requisição inválida. Por favor, recarregue a página.",
      };
    }
    const user = await requireUser();
    userId = user.id;

    const proofFile = formData.get("proofFile") as File | null;

      const rawData: PaymentPlanInput = {
      name: (formData.get("name") as string) || "",
      supplier: (formData.get("supplier") as string) || "",
      event: (formData.get("event") as string) || "",
      value: parseFloat(formData.get("value") as string),
      dueDate: (formData.get("dueDate") as string) || "",
      responsible: (formData.get("responsible") as string) || "",
      status: (formData.get("status") as "PENDING" | "PAID" | "OVERDUE") || "PENDING",
      proofFile: proofFile || undefined,
    };


    const validateData = PaymentPlanSchema.safeParse(rawData);

    if (!validateData.success) {
        return {
            success: false,
            error: validateData.error.issues[0].message,
        };
    }

    const { name, supplier, event, value, dueDate, responsible, status, proofFile: validateProofFile } =
      validateData.data;

      let proofUrl: string | null = null;
      if (validateProofFile) {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(validateProofFile.type)) {
            return {
                success: false,
                error: "Tipo de arquivo inválido. Apenas JPEG, PNG e PDF são permitidos.",
            };
      }
      if (validateProofFile.size > 5 * 1024 * 1024) {
        return {
            success: false,
            error: "O tamanho do arquivo excede o limite de 5MB.",
        };
      }

       try {
        proofUrl = await uploadToCloudinary(validateProofFile);
      } catch (uploadError) {
        logger.error("Upload error", {}, uploadError as Error);
        return {
          success: false,
          error: "Erro ao fazer upload do comprovante. Tente novamente.",
        };
      }

    }

    const paymentPlan = await prisma.paymentPlan.create({
      data: {
        name: sanitizeText(name, 200),
        supplier: supplier ? sanitizeText(supplier, 200) : null,
        event: event ? sanitizeText(event, 100) : null,
        value,
        dueDate: new Date(dueDate),
        responsible: responsible ? sanitizeText(responsible, 100) : null,
        status,
        proofUrl: proofUrl || null,
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

        return plans.map(plan => ({
            ...plan,
            value: Number(plan.value),
        }));
    } catch (error) {
        logger.error("Error fetching payment plans", {}, error as Error);
        return [];
    }
        
 }

export async function updatePaymentPlanStatus(id: string, status: "PENDING" | "PAID" | "OVERDUE") {
    let userId =  "unknown";
    const path = "/planejamento";
    
  try {
    const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return { success: false, error: "Requisição inválida." };
    }

    const user = await requireUser();
    userId = user.id;

    if (!id || !["PENDING", "PAID", "OVERDUE"].includes(status)) {
      return { success: false, error: "Dados inválidos." };
    }

    const updatedPlan = await prisma.paymentPlan.update({
      where: { id, createdById: user.id }, // Garante que o usuário só atualiza seus próprios planos
      data: { status },
    });
     revalidatePath(path);
    return { success: true, data: updatedPlan };

} catch (error) {
     const errorId = `plan-update-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    logger.error("Error updating payment plan status", { errorId, userId, id }, error as Error);
    return { success: false, error: `Erro ao atualizar status. ID do erro: ${errorId}` };
  }
}

export async function updatePaymentPlan(id: string, formData: FormData) {
    let userId = "unknown";
    const path = "/planejamento";

    try {
        const csrfValid = await validateCsrf();
        if (!csrfValid) {
            return {
                success: false,
                error: "Requisição inválida. Por favor, recarregue a página.",
            };
        }

        const user = await requireUser();
        userId = user.id;

        if (!id) {  
            return { success: false, error: "ID do plano de pagamento é obrigatório."};
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


    const proofFile = formData.get("proofFile") as File | null;

       const rawData: PaymentPlanInput = {
      name: (formData.get("name") as string) || "",
      supplier: (formData.get("supplier") as string) || "",
      event: (formData.get("event") as string) || "",
      value: parseFloat(formData.get("value") as string),
      dueDate: (formData.get("dueDate") as string) || "",
      responsible: (formData.get("responsible") as string) || "",
      status: (formData.get("status") as "PENDING" | "PAID" | "OVERDUE") || "PENDING",
      proofFile: proofFile || undefined,
    };


    const validateData = PaymentPlanSchema.safeParse(rawData);

    if (!validateData.success) {
      return {
        success: false,
        error: validateData.error.issues[0].message,
      };
    }

    const { name, supplier, event, value, dueDate, responsible, status, proofFile: validatedProofFile } =
      validateData.data;
 let proofUrl = existingPlan.proofUrl; // Manter URL anterior se não houver novo upload

    if (validatedProofFile) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(validatedProofFile.type)) {
        return {
          success: false,
          error: "Apenas imagens (JPG, PNG) e PDFs são permitidos",
        };
      }

      if (validatedProofFile.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: "O arquivo não pode exceder 5MB",
        };
      }
       try {
        proofUrl = await uploadToCloudinary(validatedProofFile);
      } catch (updateError) {
        logger.error("Upload error", {}, updateError as Error);
        return {
          success: false,
          error: "Erro ao fazer upload do comprovante. Tente novamente.",
        };
      }
    }

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
        proofUrl: proofUrl || null,
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
  const path = "/planejamento";

  try {
    const csrfValid = await validateCsrf();
    if (!csrfValid) {
      return { success: false, error: "Requisição inválida." };
    }

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
