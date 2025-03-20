import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionFilters from "@/components/ui/features/transacciones/filters";

describe("TransactionFilters Component", () => {
  let setDateFilter,
    setTypeFilter,
    setCategoryFilter,
    setSortField,
    setSortOrder;

  beforeEach(() => {
    setDateFilter = jest.fn();
    setTypeFilter = jest.fn();
    setCategoryFilter = jest.fn();
    setSortField = jest.fn();
    setSortOrder = jest.fn();
  });

  const renderFilters = (props = {}) => {
    return render(
      <TransactionFilters
        dateFilter="all"
        setDateFilter={setDateFilter}
        typeFilter="all"
        setTypeFilter={setTypeFilter}
        categoryFilter="all"
        setCategoryFilter={setCategoryFilter}
        sortField="date"
        setSortField={setSortField}
        sortOrder="asc"
        setSortOrder={setSortOrder}
        {...props}
      />,
    );
  };

  it("renders all dropdowns and reset button", () => {
    renderFilters();
    expect(screen.getByText("Periodo:")).toBeInTheDocument();
    expect(screen.getByText("Tipo:")).toBeInTheDocument();
    expect(screen.getByText("Categoría:")).toBeInTheDocument();
    expect(screen.getByText("Ordenar por:")).toBeInTheDocument();
    expect(screen.getByText("Restablecer filtros")).toBeInTheDocument();
  });

  it("calls set functions on select change", () => {
    const { container } = renderFilters();
    const selects = container.querySelectorAll("select");

    // Change Period filter
    fireEvent.change(selects[0], { target: { value: "day" } });
    expect(setDateFilter).toHaveBeenCalledWith("day");

    // Change Type filter
    fireEvent.change(selects[1], { target: { value: "income" } });
    expect(setTypeFilter).toHaveBeenCalledWith("income");

    // Change Category filter
    fireEvent.change(selects[2], { target: { value: "food" } });
    expect(setCategoryFilter).toHaveBeenCalledWith("food");

    // Change Sort Field filter
    fireEvent.change(selects[3], { target: { value: "amount" } });
    expect(setSortField).toHaveBeenCalledWith("amount");
  });

  it("resets filters when reset button is clicked", () => {
    renderFilters({
      dateFilter: "day",
      typeFilter: "income",
      categoryFilter: "food",
      sortField: "amount",
      sortOrder: "asc",
    });
    const resetButton = screen.getByRole("button", {
      name: /Restablecer filtros/i,
    });
    fireEvent.click(resetButton);
    expect(setDateFilter).toHaveBeenCalledWith("all");
    expect(setTypeFilter).toHaveBeenCalledWith("all");
    expect(setCategoryFilter).toHaveBeenCalledWith("all");
    expect(setSortField).toHaveBeenCalledWith("date");
    expect(setSortOrder).toHaveBeenCalledWith("dsc");
  });
});
