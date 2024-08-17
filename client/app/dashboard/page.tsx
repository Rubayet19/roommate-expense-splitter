'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import AllExpenses from './AllExpenses';
import RoommatesList from './RoommatesList';
import AddExpenseForm from './components/AddExpenseForm';
import SettleUpForm from './components/SettleUpForm';
import { Roommate, User, SettlementDTO, ExpenseDTO } from './types/shared';
import ProtectedRoute from '../components/ProtectedRoute';
import { logout } from '../services/authService';
import { useRouter } from 'next/navigation';
import { getRoommates } from '../services/roommateService';
import { addExpense, getUserExpenses, getUserBalances } from '../services/expenseService';
import { getCurrentUser } from '../services/userService';
import { createSettlement } from '../services/settlementService';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'allExpenses' | 'roommates'>('dashboard');
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettleUpForm, setShowSettleUpForm] = useState(false);
  const [balances, setBalances] = useState<{ [key: number]: number }>({});
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [balanceSummary, setBalanceSummary] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0
  });

  const router = useRouter();

  const handleRoommatesChange = (updatedRoommates: Roommate[]) => {
    setRoommates(updatedRoommates);
  };

  const calculateBalanceSummary = useCallback(() => {
    const youOwe = Object.entries(balances)
      .filter(([roommateId, balance]) => balance > 0 && roommates.some(r => r.id === parseInt(roommateId)))
      .reduce((sum, [_, balance]) => sum + balance, 0);

    const youAreOwed = Object.entries(balances)
      .filter(([roommateId, balance]) => balance < 0 && roommates.some(r => r.id === parseInt(roommateId)))
      .reduce((sum, [_, balance]) => sum - balance, 0);

    const totalBalance = youAreOwed - youOwe;

    setBalanceSummary({ totalBalance, youOwe, youAreOwed });
  }, [balances, roommates]);

  useEffect(() => {
    console.log('Dashboard page mounted');
    fetchCurrentUser();
    fetchRoommates();
    fetchExpenses();
    fetchBalances();
  }, []);

  useEffect(() => {
    calculateBalanceSummary();
  }, [balances, roommates, calculateBalanceSummary]);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
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

  const fetchRoommates = async () => {
    try {
      const fetchedRoommates = await getRoommates();
      setRoommates(fetchedRoommates);
    } catch (error) {
      console.error('Error fetching roommates:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const fetchedExpenses = await getUserExpenses();
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAddExpense = async (expense: ExpenseDTO) => {
    try {
      await addExpense(expense);
      await fetchExpenses();
      await fetchBalances();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleSettleUp = async (settlement: SettlementDTO) => {
    try {
      await createSettlement(settlement);
      await fetchBalances();
      setShowSettleUpForm(false);
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  const handleExpenseDeleted = async () => {
    await fetchExpenses();
    await fetchBalances();
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen -m-5">
        <nav className="bg-white">
          <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex">
                <Link href="/dashboard" className="flex-shrink-0 flex items-center text-base text-black font-semibold" onClick={() => setActiveTab('dashboard')}>
                  Home
                </Link>
              </div>
              <div className="flex items-center relative">
                <span 
                  className="text-black mr-4 font-semibold cursor-pointer"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  User
                </span>
                {showUserDropdown && (
                  <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                    <Link href="/user-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      Your Account
                    </Link>
                  </div>
                )}
                <button
                  className="bg-black hover:bg-slate-700 text-white text-sm font-semibold py-2 px-3 rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <hr className="border-gray-200" />
        <div className="flex flex-1">
          <div className="w-60 bg-white shadow-xl rounded-md">
            <ul className="py-4">
              <li   
                className={`mx-2 rounded cursor-pointer ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-600' : 'hover:bg-slate-50'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="block px-4 py-2">Dashboard</span>
              </li>
              <li 
                className={`mx-2 rounded cursor-pointer ${activeTab === 'allExpenses' ? 'bg-slate-100 text-slate-600' : 'hover:bg-slate-50'}`}
                onClick={() => setActiveTab('allExpenses')}
              >
                <span className="block px-4 py-2">All Expenses</span>
              </li>
              <li 
                className={`mx-2 rounded cursor-pointer ${activeTab === 'roommates' ? 'bg-slate-100 text-slate-600' : 'hover:bg-slate-50'}`}
                onClick={() => setActiveTab('roommates')}
              >
                <span className="block px-4 py-2">Roommates</span>
              </li>
            </ul>
          </div>
          
          <main className="flex-1 flex-col bg-slate-100 p-6 overflow-y-auto pr-28 pl-12">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <div>
                    <button 
                      className="bg-black hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded mr-2"
                      onClick={() => setShowAddExpenseForm(true)}
                    >
                      Add an Expense
                    </button>
                    <button 
                      className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                      onClick={() => setShowSettleUpForm(true)}
                    >
                      Settle Up
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-3 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Total Balance</h2>
                    <p className={`text-xl font-bold ${balanceSummary.totalBalance !== 0 ? (balanceSummary.totalBalance > 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-500'}`}>
                      {balanceSummary.totalBalance === 0 ? '$0' : (
                        <>
                          {balanceSummary.totalBalance > 0 ? '+' : '-'}${Math.abs(balanceSummary.totalBalance).toFixed(2)}
                          <span className="text-sm font-normal ml-1">
                            {balanceSummary.totalBalance > 0 ? 'You are Owed' : 'You Owe'}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">You Owe</h2>
                    <p className="text-xl font-bold text-red-500">
                      ${balanceSummary.youOwe.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">You are Owed</h2>
                    <p className="text-xl font-bold text-green-500">
                      ${balanceSummary.youAreOwed.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-100 p-4 rounded-lg ">
                    <h2 className="text-xl font-semibold mb-4">YOU OWE</h2>
                    <ul className='pt-4'>
                      {Object.entries(balances)
                        .filter(([roommateId, balance]) => balance > 0 && roommates.some(r => r.id === parseInt(roommateId)))
                        .map(([roommateId, balance]) => {
                          const roommate = roommates.find(r => r.id === parseInt(roommateId));
                          if (!roommate) return null;
                          return (
                            <li key={roommateId} className="flex items-center mb-5">
                              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                              <span className="flex-grow">{roommate.name}</span>
                              <span className="font-semibold text-red-500">you owe ${balance.toFixed(2)}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg ">
                    <h2 className="text-xl font-semibold mb-4">YOU ARE OWED</h2>
                    <ul className='pt-4'>
                      {Object.entries(balances)
                        .filter(([roommateId, balance]) => balance < 0 && roommates.some(r => r.id === parseInt(roommateId)))
                        .map(([roommateId, balance]) => {
                          const roommate = roommates.find(r => r.id === parseInt(roommateId));
                          if (!roommate) return null;
                          return (
                            <li key={roommateId} className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                              <span className="flex-grow">{roommate.name}</span>
                              <span className="font-semibold text-green-500">owes you ${Math.abs(balance).toFixed(2)}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'allExpenses' && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">All Expenses</h1>
                <AllExpenses onExpenseDeleted={handleExpenseDeleted} />
              </>
            )}
            {activeTab === 'roommates' && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Roommates</h1>
                <RoommatesList onRoommatesChange={handleRoommatesChange} />
              </>
            )}
          </main>
        </div>
        {showAddExpenseForm && currentUser && (
          <AddExpenseForm 
            onClose={() => setShowAddExpenseForm(false)}
            onSubmit={handleAddExpense}
            currentUser={currentUser}
            roommates={roommates}
            onRoommatesChange={handleRoommatesChange}
          />
        )}
        {showSettleUpForm && currentUser && (
          <SettleUpForm
            onClose={() => setShowSettleUpForm(false)}
            onSettleUp={handleSettleUp}
            currentUser={currentUser}
            roommates={roommates}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}