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

  return (
    <>
      <div className="p-4 flex flex-col items-center justify-between w-full h-full">
        <div className="p-4">
          <h1 className="font-bold text-2xl">Gestión de transacciones</h1>
        </div>
        <div className="flex-grow"> </div>
        <TransactionFooter onOpenCreate={setIsCreateOpen} />
      </div>
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => setIsCreateOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Transaccion</DialogTitle>
            <TransactionForm />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
