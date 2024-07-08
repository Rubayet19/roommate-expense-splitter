'use client';
import React, { useState } from 'react';
import { Roommate } from '../types/shared';

interface SettleUpFormProps {
  roommates: Roommate[];
  currentUser: Roommate;
  onSettleUp: (payer: string, receiver: string, amount: number, date: string) => void;
  onClose: () => void;
}

export default function SettleUpForm({ roommates, currentUser, onSettleUp, onClose }: SettleUpFormProps) {
  const [payer, setPayer] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const allUsers = [currentUser, ...roommates];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payer && receiver && amount && date) {
      onSettleUp(payer, receiver, parseFloat(amount), date);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-96 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Settle Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="payer" className="block text-gray-700 text-sm font-bold mb-2">
              Who paid?
            </label>
            <select
              id="payer"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select payer</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id === currentUser.id ? `${user.name} (You)` : user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="receiver" className="block text-gray-700 text-sm font-bold mb-2">
              Who received?
            </label>
            <select
              id="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select receiver</option>
              {allUsers.filter((r) => r.id !== payer).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id === currentUser.id ? `${user.name} (You)` : user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-black hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded mr-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Settle Up
          </button>
        </form>
      </div>
    </div>
  );
}
