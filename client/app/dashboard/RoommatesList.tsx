// components/RoommatesList.tsx
import React, { useState, useEffect } from 'react';
import { getRoommates, addRoommate, deleteRoommate } from '../services/roommateService';
import { getUserBalances } from '../services/expenseService';
import { motion } from 'framer-motion';

export interface Roommate {
  id: number;
  name: string;
}

interface RoommatesListProps {
  onRoommatesChange: (roommates: Roommate[]) => void;
}

export default function RoommatesList({ onRoommatesChange }: RoommatesListProps) {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [balances, setBalances] = useState<{ [key: number]: number }>({});
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
      onRoommatesChange(fetchedRoommates);
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
        const updatedRoommates = [...roommates, newRoommate];
        setRoommates(updatedRoommates);
        onRoommatesChange(updatedRoommates);
        setNewRoommateName('');
        setShowAddRoommateModal(false);
      } catch (error) {
        console.error('Error adding roommate:', error);
      }
    }
  };

  const handleDeleteRoommate = async (id: number) => {
    try {
      await deleteRoommate(id);
      const updatedRoommates = roommates.filter(roommate => roommate.id !== id);
      setRoommates(updatedRoommates);
      onRoommatesChange(updatedRoommates);
    } catch (error) {
      console.error('Error deleting roommate:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Roommates</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
          onClick={() => setShowAddRoommateModal(true)}
        >
          Add Roommate
        </motion.button>
      </div>
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roommates.map((roommate) => (
              <tr
                key={roommate.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{roommate.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getBalanceColor(balances[roommate.id] || 0)}`}>
                  {getBalanceDisplay(balances[roommate.id] || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteRoommate(roommate.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {roommates.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 italic">
                  No roommates added yet. Add your first roommate to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showAddRoommateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-100"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Roommate</h3>
            <input
              type="text"
              value={newRoommateName}
              onChange={(e) => setNewRoommateName(e.target.value)}
              placeholder="Enter roommate name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddRoommateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddRoommate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={!newRoommateName.trim()}
              >
                Add
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
