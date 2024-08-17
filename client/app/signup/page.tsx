'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/authService';

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
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full text-white py-4 px-8">
        <button onClick={handleBackToHome} className="bg-black hover:bg-slate-700 text-white text-sm py-2 px-4 rounded">
          Home
        </button>
      </header>
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white p-12 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded ${isEmailValid ? 'border-green-500' : 'border-red-500'}`}
              />
              {!isEmailValid && email && <p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded ${isPasswordValid ? 'border-green-500' : 'border-red-500'}`}
              />
              {!isPasswordValid && password && (
                <p className="text-red-500 text-sm mt-1">
                  Password must be at least 8 characters long and contain at least one number, one lowercase and one uppercase letter.
                </p>
              )}
            </div>
            <button 
              type="submit" 
              className={`w-full mt-5 bg-black hover:bg-slate-700 text-white font-bold py-2 px-4 rounded ${(!isEmailValid || !isPasswordValid) && 'opacity-50 cursor-not-allowed'}`}
              disabled={!isEmailValid || !isPasswordValid}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}