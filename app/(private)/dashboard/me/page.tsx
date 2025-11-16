import { requireUser } from "@/app/(data)/users/require-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-4 lg:mx-6">
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e senha
        </p>
      </div>
      <div className="mx-4 lg:mx-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Visualize suas informações de conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.image ?? `https://avatar.vercel.sh/${user.email}`}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-lg">
                    {user.name && user.name.length > 0
                      ? user.name.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name || "Sem nome"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">ID do Usuário</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Editar Informações</CardTitle>
              <CardDescription>
                Atualize seu nome, email ou senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={{
                  name: user.name,
                  email: user.email,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
