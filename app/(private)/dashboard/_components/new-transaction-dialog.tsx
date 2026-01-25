"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      categoryId: "",
      type: "INCOME",
    },
  });
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF.");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setProofFile(file);

    // Criar preview para imagens
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setProofFile(null);
    setPreviewUrl(null);
  };


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
      values.description || undefined,
      proofFile || undefined,
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
      removeFile();
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
          removeFile();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-fullanal w-full">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                             <FormItem>
               <FormLabel>Comprovante (Opcional)</FormLabel>
              <div className="space-y-3">
                {!proofFile ? (
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Formatos aceitos: JPG, PNG, WebP ou PDF (máx. 5MB)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-32 w-32 rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -right-2 -top-2"
                          onClick={removeFile}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{proofFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FormItem> 
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
