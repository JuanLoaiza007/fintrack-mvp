import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AppSidebar } from "@/components/ui/features/sidebar";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("AppSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sidebar inside SidebarProvider", () => {
    usePathname.mockReturnValue("/metas");

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    );

    expect(screen.getByText("FinTrack")).toBeInTheDocument();
    expect(screen.getByAltText("FinTrack")).toBeInTheDocument();
  });
});
