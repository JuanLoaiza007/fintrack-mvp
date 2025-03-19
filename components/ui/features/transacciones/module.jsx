"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import TransactionFooter from "./footer";
import TransactionForm from "./form";
import TransactionHistory from "./history";

/**
 * TransactionModule Component
 *
 * @description
 * This component serves as the main module for managing transactions. It includes
 * a header, a footer with actions, and a dialog for creating new transactions.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered TransactionModule component.
 *
 * @example
 * <TransactionModule />
 *
 * @description
 * - Displays a header with the title "Gestión de transacciones".
 * - Includes a footer with actions to open the create transaction dialog or help section.
 * - Renders a dialog for creating a new transaction when the "isCreateOpen" state is true.
 *
 * @state {boolean} isCreateOpen - Controls the visibility of the create transaction dialog.
 *
 * @dependencies
 * - TransactionFooter: A component that provides footer actions.
 * - Dialog: A component for rendering modal dialogs.
 * - DialogContent, DialogHeader, DialogTitle: Subcomponents for structuring the dialog.
 * - TransactionForm: A form component for creating a new transaction.
 */
export default function TransactionModule() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsCreateOpen(true); // Corregido
  };
  
  return (
    <>
      <div className="p-4 gap-2 flex flex-col items-center justify-between w-full h-full max-h-screen overflow-y-hidden">
        <div className="p-4">
          <h1 className="font-bold text-2xl">Gestión de transacciones</h1>
        </div>
        <TransactionHistory onEdit={handleEdit}/>
        <TransactionFooter onOpenCreate={setIsCreateOpen} />
      </div>
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => setIsCreateOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
          <DialogTitle>{selectedTransaction ? "Editar Transacción" : "Crear Transacción"}</DialogTitle>
            <TransactionForm setIsCreateOpen={setIsCreateOpen} transaction={selectedTransaction} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
