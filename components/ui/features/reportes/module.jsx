"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions, clearTransactions, importTransactions } from "@/db/db";
import { generateCSV } from "@/utils/export";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { useTransactionContext } from "@/context/TransactionContext";

export default function ReportesModule() {
    const [period, setPeriod] = useState("todo");
    const [transactions, setTransactions] = useState([]);
    const [file, setFile] = useState(null);
    const { notifyTransactionUpdate } = useTransactionContext();

    useEffect(() => {
        async function loadTransactions() {
            try {
                const data = await getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Error loading transactions:", error);
            }
        }
        loadTransactions();
    }, []);
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImportReports = () => {
        if (!file) {
            alert("Por favor, seleccione un archivo CSV");
            return;
        }

        const confirmImport = window.confirm("⚠️ Esto borrará todos los registros existentes. ¿Desea continuar?");
        if (!confirmImport) return;

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                let data = results.data;
                const expectedHeaders = ['id', 'description', 'amount', 'type', 'category', 'essential', 'date'];
                const actualHeaders = Object.keys(data[0]);
                
                if (JSON.stringify(expectedHeaders) !== JSON.stringify(actualHeaders)) {
                    alert("El archivo CSV no tiene el formato correcto");
                    return;
                }

                data = data.map(item => ({
                    ...item,
                    essential: item.essential.toLowerCase() === 'true'
                }));
                await clearTransactions();
                await importTransactions(data);
                notifyTransactionUpdate();
                alert("Reporte importado correctamente");
            },
            error: (err) => {
                alert("Error al importar el archivo CSV");
                console.error(err);
            }
        });    
    }

    const handleGenerateReports = () => {
        let filteredTransactions = transactions.map(t => ({
            ...t,
            essential: t.essential !== undefined ? t.essential : false 
        }));

        const actualDate = new Date();

        switch (period) {
            case "todo":
                break;
            case "semana":
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date).getDay() === actualDate.getDay());
                break;
            case "mes":
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date).getMonth() === actualDate.getMonth());
                break;
            case "año":
                filteredTransactions = filteredTransactions.filter(t => new Date(t.date).getFullYear() === actualDate.getFullYear());
                break;
        }
        generateCSV(filteredTransactions);
    }
    return (
        <div className="p-4">
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Reportes (En Construcción)</h2>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-10 w-3/4" />
                </div>
            </div>

            <div className="mb-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4">Generar Reportes (Exportar)</h3>
                <div className="flex items-center space-x-4">
                    <Select value={period} onValueChange={(value) => setPeriod(value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Selecciona un periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectSeparator />
                            <SelectItem value="semana">Ultima semana</SelectItem>
                            <SelectSeparator />
                            <SelectItem value="mes">Ultimo mes</SelectItem>
                            <SelectSeparator />
                            <SelectItem value="año">Ultimo año</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReports}>Generar Reportes</Button>
                </div>
            </div>

            <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4">Importar Reportes (CSV)</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col">
                        <label htmlFor="file-upload" className="text-sm font-medium text-gray-700 mb-1">
                            Seleccionar archivo CSV:
                        </label>
                        <div className="flex items-center">
                            <input
                                id="file-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Elegir archivo
                            </label>
                            {file && <span className="ml-2 text-sm text-gray-600">{file.name}</span>}
                        </div>
                    </div>
                    <Button
                        onClick={handleImportReports}
                        disabled={!file}
                        className={cn(
                            "whitespace-nowrap",
                            file ? "" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        Importar Reportes
                    </Button>
                </div>
            </div>
        </div>
    );
}