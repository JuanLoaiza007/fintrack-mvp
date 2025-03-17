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

const transacctions = [
  {
    id: 1,
    date: "2021-10-10",
    description: "Pago de servicios",
    amount: 100,
    category: "utilities",
    essential: true,
  },
  {
    id: 2,
    date: "2021-10-10",
    description: "Pago de servicios",
    amount: 100,
    category: "utilities",
    essential: true,
  },
  {
    id: 3,
    date: "2021-10-10",
    description: "Pago de servicios",
    amount: 100,
    category: "utilities",
    essential: true,
  },
];

export default function TransactionModule() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="p-4 flex flex-col items-center justify-between w-full h-full">
        <div className="p-4">
          <h1 className="font-bold text-2xl">Gestión de transacciones</h1>
        </div>
        <div className="flex-grow"> </div>
        <TransactionFooter
          onOpenCreate={setIsCreateOpen}
          onOpenHelp={setIsHelpOpen}
        />
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
