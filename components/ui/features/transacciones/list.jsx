import TransactionItem from "./item";

export default function TransactionList({
  transactions,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center p-4">
          No hay transacciones registradas.
        </p>
      ) : (
        <ul className="flex-1 min-h-0 max-h-full overflow-y-auto space-y-2 p-2">
          {transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
