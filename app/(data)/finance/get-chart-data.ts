import "server-only";

import { subDays, format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export type ChartDataPoint = {
  date: string;
  entradas: number;
  saidas: number;
  saldo: number;
};

export async function getChartData(
  days: number = 90
): Promise<ChartDataPoint[]> {
await requireUser();

  const now = new Date();
  const startDate = subDays(now, days);

  // Unificar queries: buscar todas as transações aprovadas de uma vez
  const allApprovedTransactions = await prisma.transaction.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Separar transações antes e depois da data inicial
  const transactions = allApprovedTransactions.filter((t) => {
    const tDate = new Date(t.createdAt);
    return tDate >= startDate && tDate <= now;
  });

  const transacoesAntes = allApprovedTransactions.filter((t) => {
    return new Date(t.createdAt) < startDate;
  });

  // Calcular saldo acumulado antes da data inicial
  let saldoAcumulado = transacoesAntes.reduce((acc, t) => {
    const valor = Number(t.amount);
    return t.type === "INCOME" ? acc + valor : acc - valor;
  }, 0);

  // Agrupar transações por data
  const transactionsByDate = new Map<
    string,
    { entradas: number; saidas: number }
  >();

  transactions.forEach((transaction) => {
    const dateKey = format(new Date(transaction.createdAt), "yyyy-MM-dd");
    const amount = Number(transaction.amount);

    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, { entradas: 0, saidas: 0 });
    }

    const dayData = transactionsByDate.get(dateKey)!;

    if (transaction.type === "INCOME") {
      dayData.entradas += amount;
    } else if (transaction.type === "EXPENSE") {
      dayData.saidas += amount;
    }
  });

  const sortedDates = Array.from(transactionsByDate.keys()).sort();

  const chartData: ChartDataPoint[] = sortedDates.map((dateKey) => {
    const dayData = transactionsByDate.get(dateKey)!;
    saldoAcumulado += dayData.entradas - dayData.saidas;

    return {
      date: dateKey,
      entradas: dayData.entradas,
      saidas: dayData.saidas,
      saldo: saldoAcumulado,
    };
  });

  if (chartData.length === 0) {
    return [
      {
        date: format(startDate, "yyyy-MM-dd"),
        entradas: 0,
        saidas: 0,
        saldo: saldoAcumulado,
      },
    ];
  }

  return chartData;
}
