"use client";

import { useState } from "react";
import { createPaymentPlan } from "@/app/(data)/planning/planning-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreatePaymentPlanForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createPaymentPlan(formData);

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Plano de pagamento criado com sucesso!");

      e.currentTarget.reset();
      setIsOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar o plano de pagamento. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Planejamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Plano de Pagamento</DialogTitle>
          <DialogDescription>
            Crie um novo plano de pagamento para acompanhar seus gastos futuros.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pagamento *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Casa, Decoração, Ambulância"
              required
            />
          </div>

          {/* Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              name="supplier"
              placeholder="Ex: Primeira parcela, Segunda parcela"
            />
          </div>

          {/* Evento */}
          <div className="space-y-2">
            <Label htmlFor="event">Evento</Label>
            <Input
              id="event"
              name="event"
              placeholder="Ex: Covil, Festa, Evento"
            />
          </div>

          {/* Valor e Data em uma linha */}
          <div className="grid grid-cols-2 gap-4">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                required
              />
            </div>
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              name="responsible"
              placeholder="Ex: João, Maria"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="PENDING">
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="OVERDUE">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Planejamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}