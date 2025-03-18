import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

/**
 * A reusable number input component integrated with React Hook Form.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.name - The name of the input field, used for form control.
 * @param {string} props.label - The label text displayed above the input field.
 * @param {string} props.placeholder - The placeholder text displayed inside the input field.
 * @returns {JSX.Element} The rendered number input component.
 */
export default function NumberInput({ name, label, placeholder }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
