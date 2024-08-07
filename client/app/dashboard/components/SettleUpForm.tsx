// SettleUpForm.tsx

import React, { useState } from 'react';
import { User, Roommate, SettlementDTO } from '../types/shared';

interface SettleUpFormProps {
  onClose: () => void;
  onSettleUp: (settlement: SettlementDTO) => void;
  currentUser: User;
  roommates: Roommate[];
}

export default function SettleUpForm({ onClose, onSettleUp, currentUser, roommates }: SettleUpFormProps) {
  const [payer, setPayer] = useState<string>(currentUser.id.toString());
  const [receiver, setReceiver] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payer && receiver && amount && date) {
      onSettleUp({
        payerId: parseInt(payer),
        receiverId: parseInt(receiver),
        amount: parseFloat(amount),
        date: date,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Settle Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Who paid?</label>
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value={currentUser.id}>{currentUser.username} (You)</option>
              {roommates.map((roommate) => (
                <option key={roommate.id} value={roommate.id}>
                  {roommate.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Who received?</label>
            <select
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select receiver</option>
              {payer === currentUser.id.toString()
                ? roommates.map((roommate) => (
                    <option key={roommate.id} value={roommate.id}>
                      {roommate.name}
                    </option>
                  ))
                : <option value={currentUser.id}>{currentUser.username} (You)</option>
              }
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Settle Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}