import React, { useEffect, useState } from 'react';
import { getUserExpenses, deleteExpense } from '../services/expenseService';
import { getUserExpenseParticipants } from '../services/expenseParticipantService';
import { getRoommates } from '../services/roommateService';
import { ExpenseDTO, ExpenseParticipantDTO, Roommate } from '../dashboard/types/shared';
import { motion } from 'framer-motion';

const groupExpensesByMonthYear = (expenses: ExpenseDTO[]) => {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sortedExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(expense);
    return acc;
  }, {} as Record<string, ExpenseDTO[]>);
};

interface AllExpensesProps {
  onExpenseDeleted: () => void;
  roommates: Roommate[];
}

export default function AllExpenses({ onExpenseDeleted, roommates }: AllExpensesProps) {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipantDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [roommates]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedExpenses, fetchedParticipants] = await Promise.all([
        getUserExpenses(),
        getUserExpenseParticipants()
      ]);
      setExpenses(fetchedExpenses);
      setExpenseParticipants(fetchedParticipants);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await deleteExpense(expenseId);
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
      setExpenseParticipants(prevParticipants => prevParticipants.filter(participant => participant.expenseId !== expenseId));
      onExpenseDeleted(); // Call the callback to update the dashboard
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const getRoommateShareInfo = (expenseId: number) => {
    const participants = expenseParticipants.filter(ep => ep.expenseId === expenseId);
    return participants.map(participant => {
      const roommate = roommates.find(r => r.id === participant.participantId);
      return {
        name: roommate ? roommate.name : 'Unknown Roommate',
        shareAmount: participant.shareAmount
      };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupedExpenses = groupExpensesByMonthYear(expenses);
  return (
    <div>
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
        >
          <p className="text-gray-500">Loading expenses...</p>
        </motion.div>
      ) : (
        <>
          {Object.entries(groupedExpenses).length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <p className="text-gray-500 mb-4">No expenses recorded yet.</p>
              <p className="text-gray-600">Add your first expense to start tracking your shared costs!</p>
            </motion.div>
          )}
          
          {Object.entries(groupedExpenses).map(([monthYear, monthExpenses]) => (
            <motion.div 
              key={monthYear} 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{monthYear}</h2>
              <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Split Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthExpenses.map((expense) => {
                      const totalAmount = parseFloat(expense.amount);
                      const shareInfos = getRoommateShareInfo(expense.id ?? -1);
                      
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            {shareInfos.map((shareInfo, index) => {
                              const { name, shareAmount } = shareInfo;
                              const roommateGetsPayment = shareAmount > 0;
                              const absShareAmount = Math.abs(shareAmount);
                              
                              return (
                                <div key={index} className={`${roommateGetsPayment ? 'text-red-500' : 'text-green-500'} mb-1`}>
                                  ${absShareAmount.toFixed(2)} 
                                  <span className="text-gray-500 ml-1">
                                    {roommateGetsPayment 
                                      ? `(I owe ${name})` 
                                      : `(${name} owes me)`}
                                  </span>
                                </div>
                              );
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                              {expense.splitType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteExpense(expense.id ?? -1)}
                              className="text-red-500 hover:text-red-700 transition-colors font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
