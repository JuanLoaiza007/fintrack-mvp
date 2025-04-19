import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import FormWrapper from "./form-wrapper";
import { Button } from "@/components/ui/button";

/**
 * A carousel-based form component for managing and editing transactions.
 *
 * @component
 * @param {Object[]} transactions - An array of transaction objects to display in the carousel. Required.
 * @param {Function} onSave - Callback function triggered when the "Guardar Todos" button is clicked. Required.
 * @param {Function} onDelete - Callback function triggered to delete a transaction by its index. Required.
 * @param {Function} onUpdate - Callback function triggered to update a transaction. Required.
 * @remarks This component uses a custom `Carousel` component for navigation and a `FormWrapper` for editing transactions.
 * @returns {JSX.Element} A carousel with transaction forms and a save button.
 * @example
 * const transactions = [
 *   { id: 1, name: "Transaction 1", amount: 100 },
 *   { id: 2, name: "Transaction 2", amount: 200 },
 * ];
 *
 * function handleSave() {
 *   console.log("Save all transactions");
 * }
 *
 * function handleDelete(index) {
 *   console.log(`Delete transaction at index ${index}`);
 * }
 *
 * function handleUpdate(index, updatedTransaction) {
 *   console.log(`Update transaction at index ${index}`, updatedTransaction);
 * }
 *
 * <FormCarrousel
 *   transactions={transactions}
 *   onSave={handleSave}
 *   onDelete={handleDelete}
 *   onUpdate={handleUpdate}
 * />
 */
export default function FormCarrousel({
  transactions,
  onSave,
  onDelete,
  onUpdate,
}) {
  return (
    <div className="h-full flex flex-col items-center justify-between gap-6">
      <Carousel className="w-[380px]">
        <CarouselContent>
          {transactions.map((transaction, index) => (
            <CarouselItem key={index} className="p-1">
              <div className="p-4 rounded bg-white">
                <FormWrapper
                  index={index}
                  transaction={transaction}
                  onUpdate={onUpdate}
                  onDelete={() => onDelete(index)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="flex flex-col items-center gap-4">
        <div>
          <Button onClick={onSave}>Guardar Todos</Button>
        </div>
        <div className="text-sm text-gray-500">
          {transactions.length} transacciones
        </div>
      </div>
    </div>
  );
}
