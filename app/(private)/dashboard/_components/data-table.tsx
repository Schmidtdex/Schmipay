"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconLoader,
  IconX,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Utils
const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatDate = (date: Date | string) => {
  return format(new Date(date), "dd/MM/yyyy");
};

const statusConfig = {
  PENDING: {
    label: "Pendente",
    icon: IconLoader,
    className: "text-yellow-600",
  },
  APPROVED: {
    label: "Aprovado",
    icon: IconCircleCheckFilled,
    className: "text-green-600",
  },
  REJECTED: {
    label: "Rejeitado",
    icon: IconX,
    className: "text-red-600",
  },
} as const;

export type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  amount: number;
  description: string;
  createdAt: Date;
  category: string;
  createdBy: string;
};

const createColumns = (): ColumnDef<Transaction>[] => [
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"));
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Usuário",
    cell: ({ row }) => {
      const user = row.getValue("createdBy") as string;
      return <div className="font-medium">{user}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as "INCOME" | "EXPENSE";
      return (
        <Badge
          variant={type === "INCOME" ? "default" : "secondary"}
          className={
            type === "INCOME"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-600 hover:bg-red-700 text-white"
          }
        >
          {type === "INCOME" ? "Entrada" : "Saída"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const type = row.getValue("type") as "INCOME" | "EXPENSE";
      const formatted = brlFormatter.format(amount);
      return (
        <div
          className={`text-right font-medium ${
            type === "INCOME" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "INCOME" ? "+" : "-"}
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="mr-1 size-3" />
          {config.label}
        </Badge>
      );
    },
  },
];

export function DataTable({ data }: { data: Transaction[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = React.useMemo(() => createColumns(), []);

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting(updater);
    },
    []
  );

  const handlePaginationChange = React.useCallback(
    (
      updater:
        | { pageIndex: number; pageSize: number }
        | ((old: { pageIndex: number; pageSize: number }) => {
            pageIndex: number;
            pageSize: number;
          })
    ) => {
      setPagination(updater);
    },
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calcular range de exibição para paginação
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = data.length;
  const showFrom = pageIndex * pageSize + 1;
  const showTo = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extrato de Transações</CardTitle>
        <CardDescription>
          Histórico completo de saídas e entradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Mostrando {showFrom} a {showTo} de {totalRows} transação(ões)
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Itens por página
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Primeira página</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Página anterior</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Próxima página</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Última página</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
