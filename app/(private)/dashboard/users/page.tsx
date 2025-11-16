import { getUsers } from "@/app/(data)/users/get-users";
import { UsersTable } from "./_components/users-table";
import { CreateUserDialog } from "./_components/create-user-dialog";

export default async function UsersPage() {
  const usersResult = await getUsers();
  const users = usersResult.success && usersResult.data ? usersResult.data : [];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-4 flex items-center justify-between lg:mx-6">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <CreateUserDialog />
      </div>
      <div className="px-4 lg:px-6">
        <UsersTable data={users} />
      </div>
    </div>
  );
}
