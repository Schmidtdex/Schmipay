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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionSchema, type TransactionSchemaType } from "@/lib/zodSchema";
import { createTransaction } from "../actions";

type Category = {
  id: string;
  name: string;
};

type NewTransactionDialogProps = {
  categories: Category[];
};

export function NewTransactionDialog({
  categories,
}: NewTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "INCOME" | "EXPENSE" | null
  >(null);

  const form = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      categoryId: "",
      type: "INCOME",
    },
  });

  const onSubmit = async (values: TransactionSchemaType) => {
    if (!transactionType) {
      toast.error("Selecione o tipo de transação");
      return;
    }

    setLoading(true);
    const result = await createTransaction(
      transactionType,
      values.amount,
      values.categoryId,
      values.description || undefined
    );

    setLoading(false);

    if (result.success) {
      toast.success(
        transactionType === "INCOME"
          ? "Depósito criado com sucesso!"
          : "Saque criado com sucesso!"
      );
      form.reset({
        amount: 0,
        description: "",
        categoryId: "",
        type: transactionType,
      });
      setOpen(false);
      setTransactionType(null);
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao criar transação");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset({
            amount: 0,
            description: "",
            categoryId: "",
            type: "INCOME",
          });
          setTransactionType(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-fullanal w-full">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Escolha o tipo de transação e preencha os dados
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transação *</FormLabel>
                  <Select
                    onValueChange={(value: "INCOME" | "EXPENSE") => {
                      field.onChange(value);
                      setTransactionType(value);
                    }}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INCOME">Depósito (Entrada)</SelectItem>
                      <SelectItem value="EXPENSE">Saque (Saída)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      disabled={loading}
                      {...field}
                      value={field.value === 0 ? "" : field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Rejeitar notação científica e caracteres inválidos
                        if (value && /[eE]/.test(value)) {
                          return;
                        }
                        const sanitizedValue = value.replace(",", ".");
                        if (sanitizedValue === "") {
                          field.onChange(0);
                          return;
                        }
                        const numValue = parseFloat(sanitizedValue);
                        if (
                          !isNaN(numValue) &&
                          isFinite(numValue) &&
                          numValue >= 0
                        ) {
                          field.onChange(numValue);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição da transação"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  {categories.length === 0 ? (
                    <div className="flex h-9 items-center rounded-md border border-dashed border-muted-foreground/25 px-3 text-sm text-muted-foreground">
                      Nenhuma categoria encontrada. Crie uma categoria primeiro.
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
              <Button
                type="submit"
                disabled={
                  loading || categories.length === 0 || !transactionType
                }
              >
                {loading ? "Processando..." : "Criar Transação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
