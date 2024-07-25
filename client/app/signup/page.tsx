'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/authService';



export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, password);
      router.push('/login');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    console.log('Google Sign-In clicked');
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
              <label htmlFor="username" className="block mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            {/* <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div> */}
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button type="submit" className="w-full mt-5 bg-black hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
              Sign Up
            </button>
          </form>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 mt-4 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* Google SVG path data */}
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}