"use client";

import * as React from "react";
import { GalleryVerticalEnd, PackageSearch, ReceiptText } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const data = {
    user: {
      name: session?.user?.name || "shadcn",
      email: session?.user?.email || "m@example.com",
      avatar: session?.user?.image || "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "MUHAMAD RAFLI RABANI",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Products",
        url: "#",
        icon: PackageSearch,
        isActive: true,
        items: [
          {
            title: "Products",
            url: "/dashboard/products",
          },
        ],
      },
      {
        title: "Orders",
        url: "#",
        icon: ReceiptText,
        isActive: false,
        items: [
          {
            title: "Orders",
            url: "/dashboard/orders",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
