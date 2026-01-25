"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  updatePaymentPlanStatus,
  updatePaymentPlan,
  deletePaymentPlan,
} from "@/app/(data)/planning/planning-actions";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface PaymentPlan {
  id: string;
  name: string;
  supplier: string | null;
  event: string | null;
  value: number;
  dueDate: Date;
  status: "PENDING" | "PAID" | "OVERDUE";
  responsible: string | null;
  createdById: string;
}

interface PaymentPlanTableProps {
  plans: PaymentPlan[];
}

const statusConfig = {
  PENDING: { label: "Pendente", variant: "secondary" as const },
  PAID: { label: "Pago", variant: "default" as const },
  OVERDUE: { label: "Atrasado", variant: "destructive" as const },
};

function EditPaymentPlanDialog({ plan, onClose }: { plan: PaymentPlan; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updatePaymentPlan(plan.id, formData);

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Plano de pagamento atualizado com sucesso!");

      onClose();
      setIsLoading(false);
    } catch (error) {
      toast.error("Erro ao atualizar plano de pagamento. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Editar Plano de Pagamento</DialogTitle>
        <DialogDescription>
          Atualize os dados do plano de pagamento.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="edit-name">Nome do Pagamento *</Label>
          <Input
            id="edit-name"
            name="name"
            defaultValue={plan.name}
            required
          />
        </div>

        {/* Fornecedor */}
        <div className="space-y-2">
          <Label htmlFor="edit-supplier">Fornecedor</Label>
          <Input
            id="edit-supplier"
            name="supplier"
            defaultValue={plan.supplier || ""}
          />
        </div>

        {/* Evento */}
        <div className="space-y-2">
          <Label htmlFor="edit-event">Evento</Label>
          <Input
            id="edit-event"
            name="event"
            defaultValue={plan.event || ""}
          />
        </div>

        {/* Valor e Data em uma linha */}
        <div className="grid grid-cols-2 gap-4">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="edit-value">Valor *</Label>
            <Input
              id="edit-value"
              name="value"
              type="number"
              step="0.01"
              defaultValue={plan.value}
              required
            />
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Data de Vencimento *</Label>
            <Input
              id="edit-dueDate"
              name="dueDate"
              type="date"
              defaultValue={format(new Date(plan.dueDate), "yyyy-MM-dd")}
              required
            />
          </div>
        </div>

        {/* Responsável */}
        <div className="space-y-2">
          <Label htmlFor="edit-responsible">Responsável</Label>
          <Input
            id="edit-responsible"
            name="responsible"
            defaultValue={plan.responsible || ""}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select name="status" defaultValue={plan.status}>
            <SelectTrigger id="edit-status">
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function DeletePaymentPlanDialog({ plan, onClose }: { plan: PaymentPlan; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);

    try {
      const result = await deletePaymentPlan(plan.id);

      if (!result.success) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Plano de pagamento deletado com sucesso!");

      onClose();
      setIsLoading(false);
    } catch (error) {
      toast.error("Erro ao deletar plano de pagamento. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deletar Plano de Pagamento</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja deletar o plano <strong>{plan.name}</strong>?
          Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={isLoading}
          onClick={handleDelete}
        >
          {isLoading ? "Deletando..." : "Deletar"}
        </Button>
      </div>
    </DialogContent>
  );
}

export function PaymentPlanTable({ plans }: PaymentPlanTableProps) {
  const [filter, setFilter] = useState("all");
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PaymentPlan | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredPlans = useMemo(() => {
    if (filter === "all") return plans;
    return plans.filter((plan) => plan.status === filter);
  }, [plans, filter]);

  const totalValue = useMemo(() => {
    return filteredPlans.reduce((sum, plan) => sum + plan.value, 0);
  }, [filteredPlans]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleEdit = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setIsEditOpen(true);
  };

  const handleDelete = (plan: PaymentPlan) => {
    setDeletingPlan(plan);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PENDING")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "PAID" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PAID")}
          >
            Pagos
          </Button>
          <Button
            variant={filter === "OVERDUE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("OVERDUE")}
          >
            Atrasados
          </Button>
        </div>

        <div className="text-sm font-semibold">
          Total: <span className="text-lg">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum plano de pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.supplier || "-"}</TableCell>
                  <TableCell>{plan.event || "-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(plan.value)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(plan.dueDate), "dd 'de' MMM", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[plan.status].variant}>
                      {statusConfig[plan.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.responsible || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild style={{ display: "none" }} />
        {editingPlan && (
          <EditPaymentPlanDialog
            plan={editingPlan}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </Dialog>

      {/* Dialog de Deleção */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild style={{ display: "none" }} />
        {deletingPlan && (
          <DeletePaymentPlanDialog
            plan={deletingPlan}
            onClose={() => setIsDeleteOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
}