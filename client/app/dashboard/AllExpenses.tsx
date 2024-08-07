// components/AllExpenses.tsx
import React, { useEffect, useState } from 'react';
import { getUserExpenses } from '../services/expenseService';
import { getUserExpenseParticipants } from '../services/expenseParticipantService';
import { ExpenseDTO, ExpenseParticipantDTO } from '../dashboard/types/shared';

const groupExpensesByMonthYear = (expenses: ExpenseDTO[]) => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(expense);
    return acc;
  }, {} as Record<string, ExpenseDTO[]>);
};

export default function AllExpenses() {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipantDTO[]>([]);

  useEffect(() => {
    fetchExpenses();
    fetchExpenseParticipants();
  }, []);

  const fetchExpenses = async () => {
    try {
      const fetchedExpenses = await getUserExpenses();
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchExpenseParticipants = async () => {
    try {
      const fetchedParticipants = await getUserExpenseParticipants();
      setExpenseParticipants(fetchedParticipants);
    } catch (error) {
      console.error('Error fetching expense participants:', error);
    }
  };

  const getUserShareAmount = (expenseId: number) => {
    const participant = expenseParticipants.find(ep => ep.expenseId === expenseId);
    return participant ? participant.shareAmount : 0;
  };

  const groupedExpenses = groupExpensesByMonthYear(expenses);

  return (
    <div>
      {Object.entries(groupedExpenses).map(([monthYear, monthExpenses]) => (
        <div key={monthYear} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{monthYear}</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthExpenses.map((expense) => {
                  const totalAmount = parseFloat(expense.amount);
                  const shareAmount = getUserShareAmount(expense.id);
                  
                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${totalAmount.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${shareAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {shareAmount > 0 
                          ? `You owe $${shareAmount.toFixed(2)}` 
                          : `You are owed $${Math.abs(shareAmount).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.splitType}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}