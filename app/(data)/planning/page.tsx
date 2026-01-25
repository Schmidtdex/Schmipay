import { getPaymentPlans } from "@/app/(data)/planning/planning-actions";
import { requireUser } from "@/app/(data)/users/require-user";
import { CreatePaymentPlanForm } from "./_components/CreatePayment";
import { PaymentPlanTable } from "./_components/PaymentPlanTable";

export default async function PlanningPage() {
  await requireUser();
  const paymentPlans = await getPaymentPlans();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Planejamento</h1>
          <p className="text-muted-foreground">
            Gerencie seus planos de pagamento e acompanhe os gastos futuros.
          </p>
        </div>
      </div>

      {/* Botão de Criar */}
      <div className="px-4 lg:px-6">
        <CreatePaymentPlanForm />
      </div>

      {/* Tabela */}
      <div className="px-4 lg:px-6">
        <PaymentPlanTable plans={paymentPlans} />
      </div>
    </div>
  );
}