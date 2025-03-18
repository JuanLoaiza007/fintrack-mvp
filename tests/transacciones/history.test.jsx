import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionFilters from "@/components/ui/features/transacciones/filters";

describe("TransactionFilters", () => {
  const mockSetDateFilter = jest.fn();
  const mockSetTypeFilter = jest.fn();
  const mockSetCategoryFilter = jest.fn();
  const mockSetSortField = jest.fn();
  const mockSetSortOrder = jest.fn();

  const defaultProps = {
    dateFilter: "all",
    setDateFilter: mockSetDateFilter,
    typeFilter: "all",
    setTypeFilter: mockSetTypeFilter,
    categoryFilter: "all",
    setCategoryFilter: mockSetCategoryFilter,
    sortField: "date",
    setSortField: mockSetSortField,
    sortOrder: "asc",
    setSortOrder: mockSetSortOrder,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all filter labels and reset button", () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByText("Periodo:")).toBeInTheDocument();
    expect(screen.getByText("Tipo:")).toBeInTheDocument();
    expect(screen.getByText("Categoría:")).toBeInTheDocument();
    expect(screen.getByText("Ordenar por:")).toBeInTheDocument();
    expect(screen.getByText(/Restablecer filtros/i)).toBeInTheDocument();
  });

  it("calls reset functions when reset button is clicked", () => {
    render(<TransactionFilters {...defaultProps} />);
    const resetButton = screen.getByText(/Restablecer filtros/i);
    fireEvent.click(resetButton);
    expect(mockSetDateFilter).toHaveBeenCalledWith("all");
    expect(mockSetTypeFilter).toHaveBeenCalledWith("all");
    expect(mockSetCategoryFilter).toHaveBeenCalledWith("all");
    expect(mockSetSortField).toHaveBeenCalledWith("date");
    expect(mockSetSortOrder).toHaveBeenCalledWith("dsc");
  });
});
