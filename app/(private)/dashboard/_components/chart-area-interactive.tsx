"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartDataPoint } from "@/app/(data)/finance/get-chart-data";

export const description = "An interactive area chart";

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "hsl(142, 76%, 36%)", // Verde
  },
  saidas: {
    label: "Saídas",
    color: "hsl(0, 84%, 60%)", // Vermelho
  },
  saldo: {
    label: "Saldo",
    color: "hsl(45, 93%, 47%)", // Amarelo
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data: ChartDataPoint[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [data, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Visão geral das entradas, saídas e saldo
          </span>
          <span className="@[540px]/card:hidden">Fluxo de caixa</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-entradas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-entradas)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-saidas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-saidas)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-saldo)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-saldo)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="entradas"
              type="natural"
              fill="url(#fillEntradas)"
              stroke="var(--color-entradas)"
              stackId="a"
            />

            <Area
              dataKey="saidas"
              type="natural"
              fill="url(#fillSaidas)"
              stroke="var(--color-saidas)"
              stackId="a"
            />

            <Area
              dataKey="saldo"
              type="natural"
              fill="url(#fillSaldo)"
              stroke="var(--color-saldo)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
