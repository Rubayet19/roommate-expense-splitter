// components/AllExpenses.tsx
import React from 'react';

interface Expense {
  id: number;
  date: string;
  description: string;
  category: string;
  amountPaid: number;
  amountOwed: number;
  dueDate: string;
  owedTo: string;
  isUserOwing: boolean;
}

const mockExpenses: Expense[] = [
  {
    id: 1,
    date: '2024-07-01',
    description: 'Monthly Rent',
    category: 'Housing',
    amountPaid: 1500,
    amountOwed: 750,
    dueDate: '2024-07-05',
    owedTo: 'John',
    isUserOwing: true,
  },
  {
    id: 2,
    date: '2024-07-03',
    description: 'Grocery Shopping',
    category: 'Food',
    amountPaid: 120,
    amountOwed: 60,
    dueDate: '2024-07-10',
    owedTo: 'Kyle',
    isUserOwing: false,
  },
  {
    id: 3,
    date: '2024-06-05',
    description: 'Utilities Bill',
    category: 'Utilities',
    amountPaid: 200,
    amountOwed: 100,
    dueDate: '2024-06-15',
    owedTo: 'Sarah',
    isUserOwing: true,
  },
];

const groupExpensesByMonthYear = (expenses: Expense[]) => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

export default function AllExpenses() {
  const groupedExpenses = groupExpensesByMonthYear(mockExpenses);

  return (
    <div>
      {Object.entries(groupedExpenses).map(([monthYear, expenses]) => (
        <div key={monthYear} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{monthYear}</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Owed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owed To/By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amountPaid.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amountOwed.toFixed(2)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${expense.isUserOwing ? 'text-red-600' : 'text-green-600'}`}>
                      {expense.isUserOwing ? `You owe ${expense.owedTo}` : `${expense.owedTo} owes you`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}