import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

/**
 * A BooleanInput component that renders a checkbox input field
 * integrated with React Hook Form's context.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.name - The name of the field, used for form control.
 * @param {string} props.label - The label displayed for the checkbox input.
 * @returns {JSX.Element} The rendered BooleanInput component.
 */
export default function BooleanInput({ name, label }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
