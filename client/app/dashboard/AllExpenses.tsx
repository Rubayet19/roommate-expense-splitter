import React, { useEffect, useState } from 'react';
import { getUserExpenses } from '../services/expenseService';
import { getUserExpenseParticipants } from '../services/expenseParticipantService';
import { getRoommates } from '../services/roommateService';
import { ExpenseDTO, ExpenseParticipantDTO, Roommate } from '../dashboard/types/shared';

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
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedExpenses, fetchedParticipants, fetchedRoommates] = await Promise.all([
        getUserExpenses(),
        getUserExpenseParticipants(),
        getRoommates()
      ]);
      setExpenses(fetchedExpenses);
      setExpenseParticipants(fetchedParticipants);
      setRoommates(fetchedRoommates);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const getRoommateShareInfo = (expenseId: number) => {
    const participant = expenseParticipants.find(ep => ep.expenseId === expenseId);
    if (!participant) return null;

    const roommate = roommates.find(r => r.id === participant.participantId);
    return {
      name: roommate ? roommate.name : 'Unknown Roommate',
      shareAmount: participant.shareAmount
    };
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthExpenses.map((expense) => {
                  const totalAmount = parseFloat(expense.amount);
                  const shareInfo = getRoommateShareInfo(expense.id ?? -1);
                  
                  if (!shareInfo) return null; // Skip if no share info found

                  const { name, shareAmount } = shareInfo;
                  const isRoommateOwed = shareAmount > 0;
                  const absShareAmount = Math.abs(shareAmount);

                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${totalAmount.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isRoommateOwed ? 'text-green-600' : 'text-red-600'}`}>
                        ${absShareAmount.toFixed(2)} 
                        <span className="text-gray-500">
                          {isRoommateOwed 
                            ? ` (${name} owes me)` 
                            : ` (I owe ${name})`}
                        </span>
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