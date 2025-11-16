"use client";

import * as React from "react";
import {
  IconDashboard,
  IconDatabase,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

type Category = {
  id: string;
  name: string;
};

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Categorias",
      url: "/dashboard/categories",
      icon: IconListDetails,
    },
    {
      title: "Usuários",
      url: "/dashboard/users",
      icon: IconUsers,
    },
  ],
  documents: [
    {
      name: "Comprovantes",
      url: "#",
      icon: IconDatabase,
    },
  ],
};

export function AppSidebar({
  categories,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  categories: Category[];
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! justify-center w-full"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} categories={categories} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
