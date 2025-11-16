"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserSchema, type UpdateUserSchemaType } from "@/lib/zodSchema";
import { updateUser } from "../actions";
import type { User } from "./users-table";

type EditUserDialogProps = {
  user: User;
  onUpdate: () => void;
};

export function EditUserDialog({ user, onUpdate }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateUserSchemaType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: undefined,
      role: (user.role as "user" | "admin") || "user",
    },
  });

  const onSubmit = async (values: UpdateUserSchemaType) => {
    setLoading(true);
    const result = await updateUser(
      user.id,
      values.name,
      values.email,
      values.password || undefined,
      values.role
    );

    setLoading(false);

    if (result.success) {
      toast.success("Usuário atualizado com sucesso!");
      form.reset({
        name: values.name,
        email: values.email,
        password: undefined,
        role: values.role,
      });
      setOpen(false);
      onUpdate();
    } else {
      toast.error(result.error || "Erro ao atualizar usuário");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset({
            name: user.name,
            email: user.email,
            password: undefined,
            role: (user.role as "user" | "admin") || "user",
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar usuário</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário. Deixe a senha em branco para
            manter a senha atual.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Deixe em branco para manter a senha atual"
                      disabled={loading}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
