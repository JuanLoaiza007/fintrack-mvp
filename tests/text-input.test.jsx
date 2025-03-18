// tests/text-input.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import TextInput from "@/components/ui/features/text-input";

// A helper Wrapper so that TextInput can access the form context:
function Wrapper({ children }) {
  const methods = useForm({
    defaultValues: {
      testField: "",
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("TextInput Component", () => {
  it("renders the label and placeholder", () => {
    render(
      <Wrapper>
        <TextInput
          name="testField"
          label="Test Label"
          placeholder="Enter text"
        />
      </Wrapper>,
    );

    // The label should be in the document:
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // The input with that placeholder should be in the document:
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("updates the value when typing", () => {
    render(
      <Wrapper>
        <TextInput
          name="testField"
          label="Test Label"
          placeholder="Enter text"
        />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText("Enter text");
    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(input.value).toBe("Hello World");
  });
});
