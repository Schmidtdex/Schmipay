"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  updateMyProfileSchema,
  type UpdateMyProfileSchemaType,
} from "@/lib/zodSchema";
import { updateMyProfile } from "../actions";

type ProfileFormProps = {
  initialData: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateMyProfileSchemaType>({
    resolver: zodResolver(updateMyProfileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      currentPassword: undefined,
      newPassword: undefined,
    },
  });

  const onSubmit = async (values: UpdateMyProfileSchemaType) => {
    setLoading(true);
    const result = await updateMyProfile(
      values.name,
      values.email,
      values.currentPassword || undefined,
      values.newPassword || undefined
    );

    setLoading(false);

    if (result.success) {
      toast.success("Perfil atualizado com sucesso!");
      form.reset({
        name: values.name,
        email: values.email,
        currentPassword: undefined,
        newPassword: undefined,
      });
    } else {
      toast.error(result.error || "Erro ao atualizar perfil");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome completo"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Senha Atual (obrigatória para alterar senha)
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite sua senha atual"
                  disabled={loading}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Necessária apenas se você quiser alterar a senha.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite a nova senha"
                  disabled={loading}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Deixe em branco para manter a senha atual. Mínimo de 8
                caracteres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({
                name: initialData.name,
                email: initialData.email,
                currentPassword: undefined,
                newPassword: undefined,
              });
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
