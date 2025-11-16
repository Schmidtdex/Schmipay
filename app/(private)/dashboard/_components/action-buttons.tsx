"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Users } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  transactionSchema,
  userSchema,
  type TransactionSchemaType,
  type UserSchemaType,
} from "@/lib/zodSchema";
import { createTransaction, createUser } from "../actions";

type Category = {
  id: string;
  name: string;
  createdAt?: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
};

export function ActionButtons({ categories }: { categories: Category[] }) {
  const [depositarOpen, setDepositarOpen] = useState(false);
  const [sacarOpen, setSacarOpen] = useState(false);
  const [usuariosOpen, setUsuariosOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const depositarForm = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      categoryId: "",
      type: "INCOME",
    },
  });

  const sacarForm = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      categoryId: "",
      type: "EXPENSE",
    },
  });

  const userForm = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onDepositarSubmit = async (values: TransactionSchemaType) => {
    setLoading(true);
    const result = await createTransaction(
      values.type,
      values.amount,
      values.categoryId,
      values.description || undefined
    );

    setLoading(false);

    if (result.success) {
      toast.success("Depósito criado com sucesso!");
      depositarForm.reset();
      setDepositarOpen(false);
    } else {
      toast.error(result.error || "Erro ao criar depósito");
    }
  };

  const onSacarSubmit = async (values: TransactionSchemaType) => {
    setLoading(true);
    const result = await createTransaction(
      values.type,
      values.amount,
      values.categoryId,
      values.description || undefined
    );

    setLoading(false);

    if (result.success) {
      toast.success("Saque criado com sucesso!");
      sacarForm.reset();
      setSacarOpen(false);
    } else {
      toast.error(result.error || "Erro ao criar saque");
    }
  };

  const onUserSubmit = async (values: UserSchemaType) => {
    setLoading(true);
    const result = await createUser(values.name, values.email, values.password);

    setLoading(false);

    if (result.success) {
      toast.success("Usuário criado com sucesso!");
      userForm.reset();
      setUsuariosOpen(false);
    } else {
      toast.error(result.error || "Erro ao criar usuário");
    }
  };

  return (
    <>
      <Card className="mx-4 lg:mx-6">
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <Button
            onClick={() => setDepositarOpen(true)}
            variant="default"
            className="flex h-24 flex-col items-center justify-center gap-3 text-base font-semibold transition-all hover:scale-105 sm:h-28"
          >
            <ArrowUpCircle className="size-8" />
            <span>Depositar</span>
          </Button>
          <Button
            onClick={() => setSacarOpen(true)}
            variant="default"
            className="flex h-24 flex-col items-center justify-center gap-3 text-base font-semibold transition-all hover:scale-105 sm:h-28"
          >
            <ArrowDownCircle className="size-8" />
            <span>Sacar</span>
          </Button>
          <Button
            onClick={() => setUsuariosOpen(true)}
            variant="outline"
            className="flex h-24 flex-col items-center justify-center gap-3 text-base font-semibold transition-all hover:scale-105 sm:h-28"
          >
            <Users className="size-8" />
            <span>Criar Usuário</span>
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Depositar */}
      <Dialog
        open={depositarOpen}
        onOpenChange={(open) => {
          setDepositarOpen(open);
          if (!open) depositarForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Depositar</DialogTitle>
            <DialogDescription>
              Registre uma nova entrada de dinheiro no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...depositarForm}>
            <form
              onSubmit={depositarForm.handleSubmit(onDepositarSubmit)}
              className="space-y-4"
            >
              <FormField
                control={depositarForm.control}
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
                            return; // Não atualiza se contém 'e' ou 'E'
                          }
                          // Permitir apenas números, ponto e vírgula (converte vírgula para ponto)
                          const sanitizedValue = value.replace(",", ".");
                          if (sanitizedValue === "") {
                            field.onChange(0);
                            return;
                          }
                          const numValue = parseFloat(sanitizedValue);
                          // Verificar se é um número válido e não é Infinity/NaN
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
                control={depositarForm.control}
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
                control={depositarForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    {categories.length === 0 ? (
                      <div className="flex h-9 items-center rounded-md border border-dashed border-muted-foreground/25 px-3 text-sm text-muted-foreground">
                        Nenhuma categoria encontrada. Crie uma categoria
                        primeiro.
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
                  onClick={() => setDepositarOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || categories.length === 0}
                >
                  {loading ? "Processando..." : "Confirmar Depósito"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Sacar */}
      <Dialog
        open={sacarOpen}
        onOpenChange={(open) => {
          setSacarOpen(open);
          if (!open) sacarForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sacar</DialogTitle>
            <DialogDescription>
              Registre uma nova saída de dinheiro no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...sacarForm}>
            <form
              onSubmit={sacarForm.handleSubmit(onSacarSubmit)}
              className="space-y-4"
            >
              <FormField
                control={sacarForm.control}
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
                            return; // Não atualiza se contém 'e' ou 'E'
                          }
                          // Permitir apenas números, ponto e vírgula (converte vírgula para ponto)
                          const sanitizedValue = value.replace(",", ".");
                          if (sanitizedValue === "") {
                            field.onChange(0);
                            return;
                          }
                          const numValue = parseFloat(sanitizedValue);
                          // Verificar se é um número válido e não é Infinity/NaN
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
                control={sacarForm.control}
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
                control={sacarForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    {categories.length === 0 ? (
                      <div className="flex h-9 items-center rounded-md border border-dashed border-muted-foreground/25 px-3 text-sm text-muted-foreground">
                        Nenhuma categoria encontrada. Crie uma categoria
                        primeiro.
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
                  onClick={() => setSacarOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || categories.length === 0}
                >
                  {loading ? "Processando..." : "Confirmar Saque"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Usuários */}
      <Dialog
        open={usuariosOpen}
        onOpenChange={(open) => {
          setUsuariosOpen(open);
          if (!open) userForm.reset();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo usuário ao sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form
              onSubmit={userForm.handleSubmit(onUserSubmit)}
              className="space-y-4"
            >
              <FormField
                control={userForm.control}
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
                control={userForm.control}
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
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Senha"
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
                  onClick={() => setUsuariosOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processando..." : "Criar Usuário"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
