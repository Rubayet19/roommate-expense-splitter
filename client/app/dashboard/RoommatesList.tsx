// components/RoommatesList.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRoommates, addRoommate } from '../services/roommateService';
import { getUserBalances } from '../services/expenseService';

export interface Roommate {
  id: number;
  name: string;
}

export default function RoommatesList() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [balances, setBalances] = useState<{ [key: number]: number }>({});
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [showAddRoommateModal, setShowAddRoommateModal] = useState(false);

  useEffect(() => {
    fetchRoommates();
    fetchBalances();
  }, []);

  const fetchRoommates = async () => {
    try {
      const fetchedRoommates = await getRoommates();
      setRoommates(fetchedRoommates);
    } catch (error) {
      console.error('Error fetching roommates:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      const fetchedBalances = await getUserBalances();
      setBalances(fetchedBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleAddRoommate = async () => {
    if (newRoommateName.trim()) {
      try {
        const newRoommate = await addRoommate(newRoommateName.trim());
        setRoommates(prev => [...prev, newRoommate]);
        setNewRoommateName('');
        setShowAddRoommateModal(false);
      } catch (error) {
        console.error('Error adding roommate:', error);
      }
    }
  };

  const getBalanceDisplay = (balance: number) => {
    if (balance === 0) return 'Settled';
    if (balance > 0) return `Owes you $${balance.toFixed(2)}`;
    return `You owe $${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-gray-500';
    if (balance > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Roommates</h2>
        <button 
          className="bg-black hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded"
          onClick={() => setShowAddRoommateModal(true)}
        >
          Add Roommate
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roommates.map((roommate) => (
              <tr
                key={roommate.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedRoommate(roommate)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{roommate.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getBalanceColor(balances[roommate.id] || 0)}`}>
                  {getBalanceDisplay(balances[roommate.id] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRoommate && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Roommate Details</h3>
          <p><strong>Name:</strong> {selectedRoommate.name}</p>
          <p><strong>Balance:</strong>
            <span className={`font-medium ${getBalanceColor(balances[selectedRoommate.id] || 0)}`}>
              {getBalanceDisplay(balances[selectedRoommate.id] || 0)}
            </span>
          </p>
          <div className="mt-4">
            <Link href={`/roommates/${selectedRoommate.id}`} className="text-blue-600 hover:underline">
              View Full Details
            </Link>
          </div>
        </div>
      )}
      {showAddRoommateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Roommate</h3>
            <input
              type="text"
              value={newRoommateName}
              onChange={(e) => setNewRoommateName(e.target.value)}
              placeholder="Enter roommate name"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddRoommateModal(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoommate}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}