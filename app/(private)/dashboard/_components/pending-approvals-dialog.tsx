"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPendingTransactionsAction } from "../pending-actions";
import { updateTransactionStatus } from "../actions";

type PendingTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  createdAt: Date;
  category: string;
  createdBy: string;
  createdByEmail: string;
};

type PendingApprovalsDialogProps = {
  pendingCount: number;
};

export function PendingApprovalsDialog({
  pendingCount,
}: PendingApprovalsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadTransactions = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPendingTransactionsAction();
      if (result.success && result.data) {
        setTransactions(result.data);
      } else {
        toast.error(result.error || "Erro ao carregar transações pendentes");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleApprove = async (transactionId: string) => {
    setProcessingId(transactionId);
    const result = await updateTransactionStatus(transactionId, "APPROVED");

    setProcessingId(null);

    if (result.success) {
      toast.success("Transação aprovada com sucesso!");
      await loadTransactions();
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao aprovar transação");
    }
  };

  const handleReject = async (transactionId: string) => {
    setProcessingId(transactionId);
    const result = await updateTransactionStatus(transactionId, "REJECTED");

    setProcessingId(null);

    if (result.success) {
      toast.success("Transação rejeitada com sucesso!");
      await loadTransactions();
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao rejeitar transação");
    }
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 group-data-[collapsible=icon]:opacity-0"
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </Badge>
          )}
          <span className="sr-only">Aprovações pendentes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprovações Pendentes</DialogTitle>
          <DialogDescription>
            Aprove ou rejeite as transações pendentes no sistema
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                Carregando transações...
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                Nenhuma transação pendente
              </div>
            </div>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {transaction.type === "INCOME" ? "Depósito" : "Saque"}
                      </CardTitle>
                      <CardDescription>
                        {formatCurrency(transaction.amount)} •{" "}
                        {transaction.category}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        transaction.type === "INCOME" ? "default" : "secondary"
                      }
                      className={
                        transaction.type === "INCOME"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }
                    >
                      {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transaction.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Descrição:
                        </p>
                        <p className="text-sm">{transaction.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Criado por:
                      </p>
                      <p className="text-sm font-medium">
                        {transaction.createdBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.createdByEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Data de criação:
                      </p>
                      <p className="text-sm">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApprove(transaction.id)}
                        disabled={
                          processingId === transaction.id ||
                          processingId !== null
                        }
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleReject(transaction.id)}
                        disabled={
                          processingId === transaction.id ||
                          processingId !== null
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
