import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/app/(private)/dashboard/_components/sidebar/app-sidebar-wrapper";
import { SiteHeader } from "@/app/(private)/dashboard/_components/site-header";

export default async function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarWrapper variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
