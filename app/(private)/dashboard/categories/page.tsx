import { getCategories } from "@/app/(data)/categories/get-categories";
import { CategoriesTable } from "./_components/categories-table";
import { CreateCategoryDialog } from "./_components/create-category-dialog";

export default async function CategoriesPage() {
  const categoriesResult = await getCategories();
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : [];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-4 flex items-center justify-between lg:mx-6">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias do sistema
          </p>
        </div>
        <CreateCategoryDialog />
      </div>
      <div className="px-4 lg:px-6">
        <CategoriesTable data={categories} />
      </div>
    </div>
  );
}
