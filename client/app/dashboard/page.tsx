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
import { motion } from 'framer-motion';

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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex-shrink-0 flex items-center text-xl text-indigo-600 font-bold">
                  Roommate Expense Splitter
                </Link>
              </div>
              <div className="flex items-center relative">
                <span 
                  className="text-gray-700 mr-4 font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  {currentUser?.username || 'User'}
                </span>
                {showUserDropdown && (
                  <div className="absolute right-0 w-48 bg-white rounded-lg shadow-lg py-1 z-10 top-full mt-1 border border-gray-100">
                    <Link href="/user-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors w-full text-left">
                      Your Account
                    </Link>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="flex flex-1 pt-6">
          <div className="w-64 bg-white shadow-sm rounded-lg mx-4 h-fit">
            <ul className="py-2">
              <li   
                className={`mx-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="block px-4 py-3 font-medium">Dashboard</span>
              </li>
              <li 
                className={`mx-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'allExpenses' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setActiveTab('allExpenses')}
              >
                <span className="block px-4 py-3 font-medium">All Expenses</span>
              </li>
              <li 
                className={`mx-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'roommates' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700 hover:text-indigo-600'}`}
                onClick={() => setActiveTab('roommates')}
              >
                <span className="block px-4 py-3 font-medium">Roommates</span>
              </li>
            </ul>
          </div>
          
          <main className="flex-1 px-4 pb-8 pr-6">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <div className="space-x-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                      onClick={() => setShowAddExpenseForm(true)}
                    >
                      Add an Expense
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                      onClick={() => setShowSettleUpForm(true)}
                    >
                      Settle Up
                    </motion.button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-3 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">Total Balance</h2>
                    <p className={`text-2xl font-bold ${balanceSummary.totalBalance !== 0 ? (balanceSummary.totalBalance > 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-500'}`}>
                      {balanceSummary.totalBalance === 0 ? '$0' : (
                        <>
                          {balanceSummary.totalBalance > 0 ? '+' : '-'}${Math.abs(balanceSummary.totalBalance).toFixed(2)}
                          <span className="text-sm font-normal ml-1 text-gray-500">
                            {balanceSummary.totalBalance > 0 ? 'You are Owed' : 'You Owe'}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">You Owe</h2>
                    <p className="text-2xl font-bold text-red-500">
                      ${balanceSummary.youOwe.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">You are Owed</h2>
                    <p className="text-2xl font-bold text-green-500">
                      ${balanceSummary.youAreOwed.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">YOU OWE</h2>
                    <ul className='pt-2 space-y-3'>
                      {Object.entries(balances)
                        .filter(([roommateId, balance]) => balance > 0 && roommates.some(r => r.id === parseInt(roommateId)))
                        .map(([roommateId, balance]) => {
                          const roommate = roommates.find(r => r.id === parseInt(roommateId));
                          if (!roommate) return null;
                          return (
                            <li key={roommateId} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-800">{roommate.name}</span>
                              <span className="font-bold text-red-500">${balance.toFixed(2)}</span>
                            </li>
                          );
                        })}
                      {Object.entries(balances).filter(([roommateId, balance]) => balance > 0 && roommates.some(r => r.id === parseInt(roommateId))).length === 0 && (
                        <li className="py-2 text-gray-500 italic">You don&apos;t owe anyone</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">YOU ARE OWED</h2>
                    <ul className='pt-2 space-y-3'>
                      {Object.entries(balances)
                        .filter(([roommateId, balance]) => balance < 0 && roommates.some(r => r.id === parseInt(roommateId)))
                        .map(([roommateId, balance]) => {
                          const roommate = roommates.find(r => r.id === parseInt(roommateId));
                          if (!roommate) return null;
                          return (
                            <li key={roommateId} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-800">{roommate.name}</span>
                              <span className="font-bold text-green-500">${Math.abs(balance).toFixed(2)}</span>
                            </li>
                          );
                        })}
                      {Object.entries(balances).filter(([roommateId, balance]) => balance < 0 && roommates.some(r => r.id === parseInt(roommateId))).length === 0 && (
                        <li className="py-2 text-gray-500 italic">No one owes you</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'allExpenses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">All Expenses</h1>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                    onClick={() => setShowAddExpenseForm(true)}
                  >
                    Add an Expense
                  </motion.button>
                </div>
                <AllExpenses onExpenseDeleted={handleExpenseDeleted} />
              </motion.div>
            )}
            
            {activeTab === 'roommates' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Roommates</h1>
                  <RoommatesList onRoommatesChange={handleRoommatesChange} />
                </div>
              </motion.div>
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
        
        {showSettleUpForm && (
          <SettleUpForm 
            onClose={() => setShowSettleUpForm(false)} 
            onSettleUp={handleSettleUp}
            roommates={roommates}
            currentUser={currentUser!}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
