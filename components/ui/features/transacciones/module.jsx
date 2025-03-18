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
