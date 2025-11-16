"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { categorySchema, type CategorySchemaType } from "@/lib/zodSchema";
import { createCategory } from "../actions";

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: CategorySchemaType) => {
    setLoading(true);
    const result = await createCategory(values.name);

    setLoading(false);

    if (result.success) {
      toast.success("Categoria criada com sucesso!");
      form.reset();
      setOpen(false);
    } else {
      toast.error(result.error || "Erro ao criar categoria");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar suas transações.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Alimentação, Transporte, Salário..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
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
                {loading ? "Processando..." : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
