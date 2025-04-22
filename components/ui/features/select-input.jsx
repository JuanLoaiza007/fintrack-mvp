import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFormContext } from "react-hook-form";

/**
 * A custom select input component integrated with React Hook Form.
 *
 * @component
 * @param {Object} props - The props for the SelectInput component.
 * @param {string} props.name - The name of the form field.
 * @param {string} props.label - The label displayed above the select input.
 * @param {string} props.placeholder - The placeholder text for the select input.
 * @param {Array} props.items - The list of items to display in the dropdown.
 * @param {string} props.items[].value - The value of a dropdown item.
 * @param {string} props.items[].label - The label of a dropdown item.
 * @returns {JSX.Element} The rendered SelectInput component.
 */
export default function SelectInput({ name, label, placeholder, items }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item, index) => (
                <SelectItem key={`${item.value}-${index}`} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
