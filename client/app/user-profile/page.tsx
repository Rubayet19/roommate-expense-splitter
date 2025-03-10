'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '../services/userService';
import { logout } from '../services/authService';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface User {
  id: number;
  username: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Redirect to login if there's an error (e.g., user is not authenticated)
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">User not found. Please <Link href="/login" className="text-indigo-600 hover:text-indigo-800">login</Link> again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-6 sm:px-0"
        >
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Your Account</h1>
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
              <p className="text-gray-900">{user.username}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">User ID</label>
              <p className="text-gray-900">{user.id}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
