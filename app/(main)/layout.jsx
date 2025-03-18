import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/features/sidebar";

/**
 * MainLayout component that provides the main layout structure for the application.
 * 
 * This component wraps its children with a `SidebarProvider` to manage the sidebar state
 * and includes the `AppSidebar` and `SidebarTrigger` components for sidebar functionality.
 * The `children` are rendered inside a `<main>` element that spans the full height and width.
 * 
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the layout.
 * @returns {JSX.Element} The rendered MainLayout component.
 */
export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="h-full w-full">{children}</main>
    </SidebarProvider>
  );
}
