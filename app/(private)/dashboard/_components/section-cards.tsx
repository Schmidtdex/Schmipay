import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSaldoEmCaixa,
  getEntradasDoMes,
  getSaidasDoMes,
  getAprovacoesPendentes,
} from "@/app/(data)/finance";

export async function SectionCards() {
  const [saldo, entradasMes, saidasMes, aprovacoesPendentes] =
    await Promise.all([
      getSaldoEmCaixa(),
      getEntradasDoMes(),
      getSaidasDoMes(),
      getAprovacoesPendentes(),
    ]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo em caixa</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$: {saldo}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Entradas do mês</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$: {entradasMes}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saídas do mês</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$: {saidasMes}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Aprovações Pendentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {aprovacoesPendentes}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
