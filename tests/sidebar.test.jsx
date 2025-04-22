import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSidebar } from "@/components/ui/features/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mocks
jest.mock("next/navigation", () => ({
  usePathname: () => "/metas",
}));

jest.mock("next/link", () => {
  return ({ href, children }) => <a href={href}>{children}</a>;
});

jest.mock("next/image", () => (props) => {
  return <img {...props} alt={props.alt || "mocked image"} />;
});

jest.mock("@/components/ui/features/ai-user-manual", () => ({
  UserManual: ({ trigger }) => (
    <div>
      <span>Mocked User Manual</span>
      {trigger}
    </div>
  ),
}));

// tests/sidebar.test.jsx
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // por compatibilidad
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Helper: envuelve con el contexto requerido
const renderWithProviders = (ui) => {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
};

describe("AppSidebar", () => {
  test("renders logo and title", () => {
    renderWithProviders(<AppSidebar />);
    expect(screen.getByAltText("FinTrack")).toBeInTheDocument();
    expect(screen.getByText("FinTrack")).toBeInTheDocument();
  });

  test("renders all sidebar menu items", () => {
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText("Transacciones")).toBeInTheDocument();
    expect(screen.getByText("Presupuestos")).toBeInTheDocument();
    expect(screen.getByText("Metas")).toBeInTheDocument();
    expect(screen.getByText("Reportes")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  test("highlights the active menu item", () => {
    renderWithProviders(<AppSidebar />);
    const metasBtn = screen.getByText("Metas");
    expect(metasBtn.closest("button")).toHaveAttribute("data-active", "true");
  });

  test("renders the 'Chatbot de ayuda' section", () => {
    renderWithProviders(<AppSidebar />);
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
    expect(screen.getByText("Chatbot de ayuda")).toBeInTheDocument();
    expect(screen.getByText("Mocked User Manual")).toBeInTheDocument();
  });

  test("clicking on Chatbot trigger does not crash", () => {
    renderWithProviders(<AppSidebar />);
    const triggerButton = screen.getByText("Chatbot de ayuda");
    expect(triggerButton).toBeInTheDocument();
    fireEvent.click(triggerButton); // simulamos interacción aunque esté mockeado
  });
});
