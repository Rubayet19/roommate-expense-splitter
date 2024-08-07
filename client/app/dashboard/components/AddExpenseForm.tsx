import React, { useState, useEffect, useRef } from 'react';
import { Roommate, ExpenseDTO, User } from '../types/shared';
import { addRoommate } from '../../services/roommateService';

interface AddExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: ExpenseDTO) => void;
  currentUser: User;
  roommates: Roommate[];
}

export default function AddExpenseForm({ onClose, onSubmit, currentUser, roommates }: AddExpenseFormProps) {
  const [expense, setExpense] = useState<ExpenseDTO>({
    description: '',
    amount: '',
    paidBy: [currentUser.id],
    splitWith: [],
    splitType: 'EQUAL',
    date: new Date().toISOString().substr(0, 10),
    splitDetails: {},
  });
  const [newRoommate, setNewRoommate] = useState('');
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const paidByRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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
      const totalAmount = parseFloat(expense.amount);
      const perPersonAmount = (totalAmount / (expense.splitWith.length + 1)).toFixed(2);
      const newSplitDetails: { [key: number]: string } = {};
      
      [currentUser.id, ...expense.splitWith].forEach(id => {
        newSplitDetails[id] = perPersonAmount;
      });

      setExpense(prev => ({
        ...prev,
        splitDetails: newSplitDetails
      }));
    }
  }, [expense.splitType, expense.amount, expense.splitWith, currentUser.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSplitWithChange = (roommateId: number) => {
    setExpense(prev => {
      const newSplitWith = prev.splitWith.includes(roommateId)
        ? prev.splitWith.filter(id => id !== roommateId)
        : [...prev.splitWith, roommateId];
      
      const newSplitDetails = { ...prev.splitDetails };
      if (newSplitWith.includes(roommateId)) {
        newSplitDetails[roommateId] = '0';
      } else {
        delete newSplitDetails[roommateId];
      }

      return {
        ...prev,
        splitWith: newSplitWith,
        splitDetails: newSplitDetails
      };
    });
  };

  const handlePaidByChange = (id: number) => {
    setExpense(prev => {
      const newPaidBy = prev.paidBy.includes(id)
        ? prev.paidBy.filter(payerId => payerId !== id)
        : [...prev.paidBy, id];

      // Ensure at least one payer is selected
      if (newPaidBy.length === 0) {
        newPaidBy.push(currentUser.id);
      }

      return { ...prev, paidBy: newPaidBy };
    });
  };

  const handleSplitDetailChange = (id: number, amount: string) => {
    setExpense(prev => ({
      ...prev,
      splitDetails: { ...prev.splitDetails, [id]: amount }
    }));
  };

  const handleAddNewRoommate = async () => {
    if (newRoommate.trim()) {
      try {
        const addedRoommate = await addRoommate(newRoommate.trim());
        roommates.push(addedRoommate);
        setNewRoommate('');
      } catch (error) {
        console.error('Error adding new roommate:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const totalAmount = parseFloat(expense.amount);
    const totalShares = Object.values(expense.splitDetails).reduce((sum, share) => sum + Math.abs(parseFloat(share)), 0);

    if (expense.splitType === 'CUSTOM' && totalShares > totalAmount) {
      setError(`The sum of individual shares (${totalShares.toFixed(2)}) exceeds the total amount (${totalAmount.toFixed(2)})`);
      return;
    }

    const submittableExpense: ExpenseDTO = {
      ...expense,
      paidBy: expense.paidBy.map(Number),
      splitWith: expense.splitWith.map(Number),
      splitDetails: Object.entries(expense.splitDetails).reduce((acc, [key, value]) => {
        const numKey = Number(key);
        if (!isNaN(numKey)) {
          acc[numKey] = value;
        }
        return acc;
      }, {} as { [key: number]: string })
    };

    console.log('Submitting expense:', submittableExpense);
    onSubmit(submittableExpense);
    onClose();
  };

  const renderSplitDetails = () => {
    const totalAmount = parseFloat(expense.amount);
    let totalAssigned = 0;

    return (
      <div className="mt-4">
        <h4 className="text-lg font-medium mb-2">Split Details:</h4>
        <div className="space-y-2">
          {[currentUser.id, ...expense.splitWith].map(id => {
            const isCurrentUser = id === currentUser.id;
            const amount = parseFloat(expense.splitDetails[id] || '0');
            totalAssigned += amount;

            return (
              <div key={id} className="flex items-center">
                <label className="w-1/3">{isCurrentUser ? 'You' : roommates.find(r => r.id === id)?.name}:</label>
                <input
                  type="number"
                  value={Math.abs(amount).toFixed(2)}
                  onChange={(e) => handleSplitDetailChange(id, e.target.value)}
                  placeholder="Share amount"
                  className="w-2/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  readOnly={expense.splitType === 'EQUAL'}
                />
                <span className="ml-2">
                  {expense.paidBy.includes(id) ? '(Paid)' : '(Owes)'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2">
          <p>Total: ${totalAmount.toFixed(2)}</p>
          <p>Assigned: ${totalAssigned.toFixed(2)}</p>
          <p>Remaining: ${(totalAmount - totalAssigned).toFixed(2)}</p>
        </div>
      </div>
    );
  };


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
                  onClick={() => handleSplitWithChange(Number(roommate.id))}
                  className={`px-2 py-1 rounded-full text-sm ${
                    expense.splitWith.includes(Number(roommate.id))
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {roommate.name} {expense.splitWith.includes(Number(roommate.id)) && '✕'}
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
                  ? (expense.paidBy[0] === currentUser.id ? currentUser.username : roommates.find(r => r.id === expense.paidBy[0])?.name)
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
                    {currentUser.username} (You)
                  </label>
                  {expense.splitWith.map(roommateId => {
                    const roommate = roommates.find(r => r.id === roommateId);
                    return roommate && (
                      <label key={roommateId} className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={expense.paidBy.includes(roommateId)}
                          onChange={() => handlePaidByChange(roommateId)}
                          className="mr-2"
                        />
                        {roommate.name}
                      </label>
                    );
                  })}
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
          {expense.splitType === 'CUSTOM' && renderSplitDetails()}
          <div className="mb-4">
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
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
              className="bg-black hover:bg-slate-700 text-white font-semibold py-1 px-4 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  ); 
}