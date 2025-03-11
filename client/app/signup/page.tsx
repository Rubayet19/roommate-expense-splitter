'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/authService';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters long and contain at least one number, one lowercase and one uppercase letter
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  };

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setIsPasswordValid(validatePassword(password));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and contain at least one number, one lowercase and one uppercase letter.');
      return;
    }

    try {
      await register(email, password);
      router.push('/login');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  }

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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  email ? (isEmailValid ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {!isEmailValid && email && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  password ? (isPasswordValid ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                }`}
                placeholder="Create a password"
              />
              {!isPasswordValid && password && (
                <p className="text-red-500 text-sm mt-1">
                  Password must be at least 8 characters long and contain at least one number, one lowercase and one uppercase letter.
                </p>
              )}
            </div>
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors ${
                (!isEmailValid || !isPasswordValid) && 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!isEmailValid || !isPasswordValid}
            >
              Sign Up
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Log in
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
