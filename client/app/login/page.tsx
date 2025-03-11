'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../services/authService';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(username, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-bold text-indigo-600">Roommate Expense Splitter</div>
          </Link>
        </div>
      </header>

      <div className="flex justify-center items-center flex-grow py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-md border border-gray-100 w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome Back</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Log In
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <footer className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center text-sm text-gray-600">
            © 2024 Rubayet Bin Mujahid. Open Source under MIT License.
          </div>
        </div>
      </footer>
    </div>
  );
}
