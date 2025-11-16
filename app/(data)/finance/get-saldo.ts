import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/(data)/users/require-user";

export async function getSaldoEmCaixa() {
await requireUser();

  // Usar query agregada para melhor performance
  const result = await prisma.$queryRaw<Array<{ saldo: number }>>`
    SELECT 
      COALESCE(
        SUM(CASE 
          WHEN type = 'INCOME' THEN amount 
          WHEN type = 'EXPENSE' THEN -amount 
          ELSE 0 
        END),
        0
      )::numeric as saldo
    FROM "Transaction"
  `;

  const saldo = result[0]?.saldo ? Number(result[0].saldo) : 0;

  return saldo;
}
