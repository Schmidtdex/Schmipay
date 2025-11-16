import { getCategories } from "@/app/(data)/categories/get-categories";
import { AppSidebar } from "./app-sidebar";

type Category = {
  id: string;
  name: string;
};

export async function AppSidebarWrapper(
  props: Omit<React.ComponentProps<typeof AppSidebar>, "categories">
) {
  const categoriesResult = await getCategories();
  const categories: Category[] =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : [];

  return <AppSidebar {...props} categories={categories} />;
}
