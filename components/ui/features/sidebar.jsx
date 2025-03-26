"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";

import { ChartArea, Award, ArrowLeftRight, HandCoins } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const items = [
  {
    title: "Transacciones",
    link: "/transacciones",
    icon: ArrowLeftRight,
  },
  {
    title: "Presupuestos",
    link: "/presupuestos",
    icon: HandCoins,
  },
  {
    title: "Metas",
    link: "/metas",
    icon: Award,
  },
  {
    title: "Reportes",
    link: "/reportes",
    icon: ChartArea,
  },
];

/**
 * Renders the application sidebar component.
 *
 * The sidebar includes a header with the application logo and title,
 * a content section with navigation links grouped under "Finanzas",
 * and a footer section. The active link is highlighted based on the
 * current path.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered sidebar component.
 */
export function AppSidebar() {
  const currentPath = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-start gap-2 px-2">
          <Image src="/icon.png" alt="FinTrack" width={40} height={40} />
          <h1 className="text-2xl font-semibold text-gray-800">FinTrack</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Finanzas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.link}>
                  <Link href={item.link} passHref>
                    <SidebarMenuButton isActive={currentPath === item.link}>
                      <item.icon className="w-6 h-6 mr-2" />
                      {item.title}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
