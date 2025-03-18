import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import NumberInput from "@/components/ui/features/number-input";

// Wrapper para proporcionar el contexto de React Hook Form
function Wrapper({ children, defaultValues }) {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("NumberInput Component", () => {
  it("renders the label and placeholder", () => {
    render(
      <Wrapper defaultValues={{ numberField: "" }}>
        <NumberInput
          name="numberField"
          label="Número"
          placeholder="Ingresa un número"
        />
      </Wrapper>,
    );

    // Verifica que el label aparezca en el documento
    expect(screen.getByText("Número")).toBeInTheDocument();

    // Verifica que el input con el placeholder aparezca en el documento
    expect(
      screen.getByPlaceholderText("Ingresa un número"),
    ).toBeInTheDocument();
  });

  it("updates the value when a number is entered", () => {
    render(
      <Wrapper defaultValues={{ numberField: "0" }}>
        <NumberInput
          name="numberField"
          label="Número"
          placeholder="Ingresa un número"
        />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText("Ingresa un número");

    // Simula el cambio en el input, ingresando un nuevo número
    fireEvent.change(input, { target: { value: "123" } });

    // Verifica que el valor del input se actualice
    expect(input.value).toBe("123");
  });
});
