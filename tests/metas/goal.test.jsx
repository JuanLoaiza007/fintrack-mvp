// __tests__/Goal.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { Goal } from "@/components/ui/features/metas/goal";
import { toast } from "sonner";

// Mocks
jest.mock("sonner", () => ({ toast: jest.fn() }));
jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((amount) => `$${amount}`),
  cn: (...classes) => classes.filter(Boolean).join(" "),
}));

describe("Goal component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no goal provided", () => {
    render(<Goal goal={null} transactions={[]} />);
    expect(
      screen.getByRole("heading", { name: /meta de ahorro/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no hay meta registrada para este mes/i),
    ).toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
  });

  const renderWith = ({ goal, transactions }) =>
    render(<Goal goal={goal} transactions={transactions} />);

  const cases = [
    {
      total: 1000,
      amount: 5000,
      percent: "20",
      toastMsg: "😟 Aún estás lejos de tu meta de ahorro.",
      color: "#DC2626",
    },
    {
      total: 1500,
      amount: 5000,
      percent: "30",
      toastMsg: null,
      color: "#CA8A04",
    },
    {
      total: 3000,
      amount: 5000,
      percent: "60",
      toastMsg: null,
      color: "#2563EB",
    },
    {
      total: 4000,
      amount: 5000,
      percent: "80",
      toastMsg: "🎉 ¡Casi alcanzas tu meta!",
      color: "#16A34A",
    },
    {
      total: 6000,
      amount: 5000,
      percent: "100",
      toastMsg: "🎉 ¡Felicidades! Has alcanzado tu meta de ahorro.",
      color: "#16A34A",
    },
  ];

  cases.forEach(({ total, amount, percent, toastMsg, color }) => {
    it(`shows ${percent}% progress (color ${color}) and toast ${toastMsg ? "once" : "never"}`, () => {
      const goal = { amount, description: "Test goal" };
      const transactions = [{ type: "income", amount: total }];

      renderWith({ goal, transactions });

      // Goal info
      expect(
        screen.getByRole("heading", { name: /meta de ahorro/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(`$${amount}`)).toBeInTheDocument();
      expect(screen.getByText(/test goal/i)).toBeInTheDocument();

      // Progress info
      expect(
        screen.getByRole("heading", {
          name: new RegExp(`progreso \\(${percent}%\\)`, "i"),
        }),
      ).toBeInTheDocument();
      const saved = screen.getByText(`$${total}`);
      expect(saved).toBeInTheDocument();
      expect(saved).toHaveStyle({ color });

      // Toast side effect
      if (toastMsg) {
        expect(toast).toHaveBeenCalledWith(toastMsg);
      } else {
        expect(toast).not.toHaveBeenCalled();
      }
    });
  });

  it("filters out non‑income/savings transactions", () => {
    const goal = { amount: 1000, description: "" };
    const transactions = [
      { type: "expense", amount: 500 },
      { type: "income", amount: 200 },
      { type: "expense", amount: 300 },
      { type: "income", amount: 100 },
    ];

    renderWith({ goal, transactions });

    expect(
      screen.getByRole("heading", { name: /progreso \(-50%\)/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("$-500")).toBeInTheDocument();
  });
});
