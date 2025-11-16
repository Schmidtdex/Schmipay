"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema, LoginSchemaType } from "@/lib/zodSchema";
import { signIn } from "@/server/users";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchemaType) {
    startTransition(async () => {
      try {
        const { success, message } = await signIn(
          values.email,
          values.password
        );
        if (success) {
          toast.success(message as string);
          router.push("/dashboard");
        } else {
          toast.error(message as string);
        }
      } catch {
        toast.error("Erro ao fazer login");
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>Faça login para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="exemplo@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <Field>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : "Login"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
