import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import SelectInput from "@/components/ui/features/select-input";

// Un pequeño wrapper para proporcionar el FormContext:
function Wrapper({ children, defaultValues }) {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("SelectInput Component", () => {
  it("renders label and placeholder, and displays items when opened", () => {
    const items = [
      { value: "val1", label: "Label 1" },
      { value: "val2", label: "Label 2" },
    ];

    render(
      <Wrapper defaultValues={{ testField: "" }}>
        <SelectInput
          name="testField"
          label="My Label"
          placeholder="Pick one"
          items={items}
        />
      </Wrapper>,
    );

    // Verifica que el label aparece:
    expect(screen.getByText("My Label")).toBeInTheDocument();

    // Verifica que el placeholder está presente:
    // (ojo: si defaultValue coincide con un valor, a veces el placeholder no se muestra)
    expect(screen.getByText("Pick one")).toBeInTheDocument();

    // Abrimos el select:
    fireEvent.click(screen.getByRole("combobox"));

    // Verifica que las opciones aparecen en el DOM:
    expect(screen.getByText("Label 1")).toBeInTheDocument();
    expect(screen.getByText("Label 2")).toBeInTheDocument();
  });

  it("updates the selected value when user clicks an item", () => {
    const items = [
      { value: "val1", label: "Label 1" },
      { value: "val2", label: "Label 2" },
    ];

    render(
      <Wrapper defaultValues={{ testField: "val1" }}>
        <SelectInput
          name="testField"
          label="My Label"
          placeholder="Pick one"
          items={items}
        />
      </Wrapper>,
    );

    // Abrimos el select:
    fireEvent.click(screen.getByRole("combobox"));

    // Hacemos click en "Label 2"
    fireEvent.click(screen.getByText("Label 2"));

    // Ahora debe aparecer "Label 2" como el valor actual del select:
    expect(screen.getByText("Label 2")).toBeInTheDocument();
  });
});
