import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import DateInput from "@/components/ui/features/date-input";

// Wrapper para proporcionar el contexto de React Hook Form
function Wrapper({ children, defaultValues }) {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("DateInput Component", () => {
  it("renders the label and placeholder when no date is selected", () => {
    render(
      <Wrapper defaultValues={{ dateField: null }}>
        <DateInput
          name="dateField"
          label="Select Date"
          placeholder="Pick a date"
        />
      </Wrapper>,
    );

    // Verifica que se muestre el label
    expect(screen.getByText("Select Date")).toBeInTheDocument();

    // Verifica que se muestre el placeholder
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("displays the formatted date when a date is selected", () => {
    const testDate = new Date("2022-01-01");
    render(
      <Wrapper defaultValues={{ dateField: testDate }}>
        <DateInput
          name="dateField"
          label="Select Date"
          placeholder="Pick a date"
        />
      </Wrapper>,
    );

    // El componente debe mostrar la fecha formateada con date-fns usando el formato "PPP"
    const formattedDate = format(testDate, "PPP");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});
