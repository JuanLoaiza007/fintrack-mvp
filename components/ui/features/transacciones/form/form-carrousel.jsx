import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useState } from "react";
import FormWrapper from "./form-wrapper";

/**
 * FormCarrousel component renders a carousel of transaction forms.
 *
 * @component
 * @param {Object[]} props.transactions - Array of transaction objects to display in the carousel. Required.
 * @remarks This component uses the `useState` hook to manage local state for transactions.
 * @returns {JSX.Element} A carousel displaying transaction forms with navigation controls.
 * @example
 * const transactions = [
 *   { id: 1, name: "Transaction 1", amount: 100 },
 *   { id: 2, name: "Transaction 2", amount: 200 },
 * ];
 * 
 * <FormCarrousel transactions={transactions} />
 */
export default function FormCarrousel({ transactions }) {
  const [localTransactions, setLocalTransactions] = useState([...transactions]);

  /**
   * Updates a specific transaction in the local state with new data.
   *
   * @param {number} index - The index of the transaction to update. Required.
   * @param {Object} updatedData - The updated transaction data. Required.
   * @returns {void} This function does not return a value.
   * @example
   * handleUpdate(0, { id: 1, name: "Updated Transaction", amount: 150 });
   */
  const handleUpdate = (index, updatedData) => {
    const updated = [...localTransactions];
    updated[index] = updatedData;
    setLocalTransactions(updated);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between gap-6">
      <Carousel className="w-[380px]">
        <CarouselContent>
          {localTransactions.map((transaction, index) => (
            <CarouselItem key={index} className="p-1">
              <div className="p-4 rounded bg-white">
                <FormWrapper
                  index={index}
                  transaction={transaction}
                  onUpdate={handleUpdate}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-sm text-gray-500">
        {localTransactions.length} transacciones
      </div>
    </div>
  );
}
