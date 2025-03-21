import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/features/sidebar";

/**
 * MainLayout component that provides the main layout structure for the application.
 * It includes a sidebar and wraps the children components with a provider for sidebar functionality.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the layout. Required.
 * @returns {JSX.Element} The rendered MainLayout component with a sidebar and main content area.
 * @remarks This component uses the SidebarProvider to manage the state of the sidebar and includes the AppSidebar and SidebarTrigger components.
 * @example
 * <MainLayout>
 *   <div>Welcome to the app!</div>
 * </MainLayout>
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
