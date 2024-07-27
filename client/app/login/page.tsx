'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../services/authService';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

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

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode<{ email: string }>(credentialResponse.credential);
        console.log(decoded);
  
        // Send the token to your backend
        const response = await axios.post('http://localhost:8080/api/auth/google', {
          token: credentialResponse.credential
        });
  
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
          router.push('/dashboard');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      } else {
        setError('Google sign-in failed. No credential received.');
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setError('An error occurred during Google sign-in. Please try again.');
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full text-white py-4 px-8">
        <button onClick={handleBackToHome} className="bg-black hover:bg-slate-700 text-white text-sm py-2 px-4 rounded">
          Home
        </button>
      </header>
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white p-14 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Log In</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
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
              Log In
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
          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={() => {
              setError('Google Sign-In failed. Please try again.');
            }}
          />
        </div>
      </div>
    </div>
  );
}