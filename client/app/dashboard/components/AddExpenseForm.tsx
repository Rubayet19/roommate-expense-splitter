import React, { useState, useEffect, useRef } from 'react';
import { Roommate, Expense, ExpenseDTO } from '../types/shared';
import { getRoommates, addRoommate } from '../../services/roommateService';

interface AddExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: ExpenseDTO) => void;
  currentUser: Roommate;
}

export default function AddExpenseForm({ onClose, onSubmit, currentUser }: AddExpenseFormProps) {
  const [expense, setExpense] = useState<ExpenseDTO>({
    description: '',
    amount: '',
    paidBy: [currentUser.id],
    splitWith: [],
    splitType: 'EQUAL',
    date: new Date().toISOString().substr(0, 10),
    splitDetails: {},
  });
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [newRoommate, setNewRoommate] = useState('');
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const paidByRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoommates();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paidByRef.current && !paidByRef.current.contains(event.target as Node)) {
        setShowPaidByDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (expense.splitType === 'EQUAL' && expense.amount) {
      const perPersonAmount = (parseFloat(expense.amount) / (expense.splitWith.length + 1)).toFixed(2);
      setExpense(prev => ({
        ...prev,
        splitDetails: {
          [currentUser.id]: perPersonAmount,
          ...expense.splitWith.reduce((acc, id) => ({ ...acc, [id]: perPersonAmount }), {})
        }
      }));
    }
  }, [expense.splitType, expense.amount, expense.splitWith]);

  const fetchRoommates = async () => {
    try {
      const fetchedRoommates = await getRoommates();
      setRoommates(fetchedRoommates);
    } catch (error) {
      console.error('Error fetching roommates:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSplitWithChange = (roommateId: string) => {
    setExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(roommateId)
        ? prev.splitWith.filter(id => id !== roommateId)
        : [...prev.splitWith, roommateId],
      paidBy: [currentUser.id] // Reset paidBy when splitWith changes
    }));
  };

  const handlePaidByChange = (id: string) => {
    setExpense(prev => ({
      ...prev,
      paidBy: prev.paidBy.includes(id)
        ? prev.paidBy.filter(payerId => payerId !== id)
        : [...prev.paidBy, id]
    }));
  };

  const handleSplitDetailChange = (id: string, amount: string) => {
    setExpense(prev => ({
      ...prev,
      splitDetails: { ...prev.splitDetails, [id]: amount }
    }));
  };

  const handleAddNewRoommate = async () => {
    if (newRoommate.trim()) {
      try {
        const addedRoommate = await addRoommate(newRoommate.trim());
        setRoommates(prev => [...prev, addedRoommate]);
        setNewRoommate('');
      } catch (error) {
        console.error('Error adding new roommate:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(expense);
    onClose();
  };

  const selectedRoommates = roommates.filter(r => expense.splitWith.includes(r.id));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add an expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">With you and:</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {roommates.map(roommate => (
                <button
                  key={roommate.id}
                  type="button"
                  onClick={() => handleSplitWithChange(roommate.id)}
                  className={`px-2 py-1 rounded-full text-sm ${
                    expense.splitWith.includes(roommate.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {roommate.name} {expense.splitWith.includes(roommate.id) && '✕'}
                </button>
              ))}
              <input
                type="text"
                value={newRoommate}
                onChange={(e) => setNewRoommate(e.target.value)}
                placeholder="Add new"
                className="px-2 py-1 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {newRoommate && (
                <button
                  type="button"
                  onClick={handleAddNewRoommate}
                  className="px-2 py-1 rounded-full text-sm bg-green-500 text-white"
                >
                  Add
                </button>
              )}
            </div>
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="description"
              value={expense.description}
              onChange={handleChange}
              placeholder="Enter a description"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={expense.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <div className="mb-4" ref={paidByRef}>
            <p className="text-sm text-gray-700 mb-1">
              Paid by
              <button
                type="button"   
                onClick={() => setShowPaidByDropdown(!showPaidByDropdown)}
                className="ml-2 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {expense.paidBy.length === 1 
                  ? (expense.paidBy[0] === currentUser.id ? currentUser.name : roommates.find(r => r.id === expense.paidBy[0])?.name)
                  : `${expense.paidBy.length} people`
                } ▼
              </button>
            </p>
            {showPaidByDropdown && (
              <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={expense.paidBy.includes(currentUser.id)}
                      onChange={() => handlePaidByChange(currentUser.id)}
                      className="mr-2"
                    />
                    {currentUser.name} (You)
                  </label>
                  {selectedRoommates.map(roommate => (
                    <label key={roommate.id} className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={expense.paidBy.includes(roommate.id)}
                        onChange={() => handlePaidByChange(roommate.id)}
                        className="mr-2"
                      />
                      {roommate.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <span className="ml-2">and split</span>
            <select
              name="splitType"
              value={expense.splitType}
              onChange={handleChange}
              className="ml-2 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EQUAL">equally</option>
              <option value="CUSTOM">by custom amounts</option>
            </select>
          </div>
          {expense.splitType === 'EQUAL' && (
            <p className="mb-4 text-sm text-gray-700">
              ${((parseFloat(expense.amount) || 0) / (expense.splitWith.length + 1)).toFixed(2)}/person
            </p>
          )}
          {expense.splitType === 'CUSTOM' && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Enter amounts:</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-1/3">{currentUser.name}:</span>
                  <input
                    type="number"
                    value={expense.splitDetails[currentUser.id] || ''}
                    onChange={(e) => handleSplitDetailChange(currentUser.id, e.target.value)}
                    className="w-2/3 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Amount"
                  />
                </div>
                {selectedRoommates.map(roommate => (
                  <div key={roommate.id} className="flex items-center">
                    <span className="w-1/3">{roommate.name}:</span>
                    <input
                      type="number"
                      value={expense.splitDetails[roommate.id] || ''}
                      onChange={(e) => handleSplitDetailChange(roommate.id, e.target.value)}
                      className="w-2/3 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Amount"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-slate-700 text-white font-semibold py-1 px-4 rounded mr-2  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}