import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const transactionSchema = z.object({
  amount: z
    .number()
    .positive("Valor deve ser maior que zero")
    .refine((n) => Number.isFinite(n), "Número inválido")
    .refine(
      (n) => !n.toString().toLowerCase().includes("e"),
      "Notação científica não é permitida"
    )
    .refine((n) => n <= 999999999.99, "Valor muito alto"),
  description: z
    .string()
    .max(200)
    .regex(/^[^<>]*$/, "Descrição não pode conter caracteres HTML")
    .optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["user", "admin"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  password: z
    .union([
      z
        .string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .max(128, "Senha muito longa"),
      z.literal(""),
    ])
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : val))
    .pipe(z.string().min(8).max(128).optional()),
  role: z.enum(["user", "admin"]).optional(),
});

export const updateMyProfileSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
    email: z.string().email("Email inválido"),
    currentPassword: z
      .string()
      .min(8, "Senha atual deve ter pelo menos 8 caracteres")
      .optional(),
    newPassword: z
      .union([
        z
          .string()
          .min(8, "Nova senha deve ter pelo menos 8 caracteres")
          .max(128, "Nova senha muito longa"),
        z.literal(""),
      ])
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : val))
      .pipe(z.string().min(8).max(128).optional()),
  })
  .refine(
    (data) => {
      // Se newPassword for fornecida, currentPassword é obrigatória
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Senha atual é obrigatória para alterar a senha",
      path: ["currentPassword"],
    }
  );

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome da categoria é obrigatório")
    .max(100, "Nome da categoria muito longo")
    .regex(/^[^<>]*$/, "Nome não pode conter caracteres HTML"),
});

export type UserSchemaType = z.infer<typeof userSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type UpdateMyProfileSchemaType = z.infer<typeof updateMyProfileSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type TransactionSchemaType = z.infer<typeof transactionSchema>;
export type CategorySchemaType = z.infer<typeof categorySchema>;
