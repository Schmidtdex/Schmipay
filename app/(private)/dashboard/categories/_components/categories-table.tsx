"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { deleteCategory } from "../actions";

export type Category = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

const formatDate = (date: Date | string) => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm");
};

type DeleteButtonProps = {
  category: Category;
  onDelete: () => void;
};

function DeleteCategoryButton({ category, onDelete }: DeleteButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteCategory(category.id);

    setLoading(false);

    if (result.success) {
      toast.success("Categoria deletada com sucesso!");
      setOpen(false);
      onDelete();
    } else {
      toast.error(result.error || "Erro ao deletar categoria");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Deletar categoria</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a categoria{" "}
              <span className="font-semibold text-foreground">
                {category.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const createColumns = (onDelete: () => void): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Nome da Categoria",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "createdBy",
    header: "Criado por",
    cell: ({ row }) => {
      const createdBy = row.getValue("createdBy") as Category["createdBy"];
      return (
        <div>
          <div className="font-medium">{createdBy.name}</div>
          <div className="text-xs text-muted-foreground">{createdBy.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs text-muted-foreground">
          {row.getValue("id")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const category = row.original;
      return <DeleteCategoryButton category={category} onDelete={onDelete} />;
    },
  },
];

export function CategoriesTable({ data }: { data: Category[] }) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleDelete = React.useCallback(() => {
    router.refresh();
  }, [router]);

  const columns = React.useMemo(
    () => createColumns(handleDelete),
    [handleDelete]
  );

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

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = data.length;
  const showFrom = pageIndex * pageSize + 1;
  const showTo = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias</CardTitle>
        <CardDescription>
          Lista de todas as categorias cadastradas no sistema
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhuma categoria encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {showFrom} a {showTo} de {totalRows} categoria
                {totalRows !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Por página:</p>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50, 100].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir para primeira página</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir para página anterior</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                  Página {pageIndex + 1} de {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir para próxima página</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir para última página</span>
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
