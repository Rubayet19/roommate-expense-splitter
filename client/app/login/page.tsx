'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://your-backend-url/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        // Login successful
        router.push('/dashboard'); // Redirect to dashboard or home page
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    console.log('Google Sign-In clicked');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full text-white py-4 px-8">
        <button onClick={handleBackToHome} className="bg-black hover:bg-slate-700 text-white text-sm  py-2 px-4 rounded">
          Home
        </button>
      </header>
      <div className="flex justify-center items-center flex-grow ">
        <div className="bg-white p-14 rounded shadow-md ">
          <h2 className="text-2xl font-bold mb-4">Log In</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 mt-4 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
              <path d="M0 12c0-6.635 5.365-12 12-12 3.239 0 5.949 1.186 8.047 3.137l-3.254 3.138c-.894-.86-2.455-1.849-4.785-1.849-4.095 0-7.439 3.389-7.439 7.574s3.345 7.574 7.439 7.574c4.75 0 6.531-3.409 6.806-5.174h-6.806V10.285h11.331c.104.599.189 1.201.189 1.989C23.76 19.131 19.166 24 12.24 24 5.605 24 0 18.635 0 12z" fill="#34A853"/>
              <path d="M12 24c6.635 0 12-5.365 12-12 0-.788-.085-1.39-.189-1.989H12.24v4.115h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.605 0 0 5.365 0 12s5.605 12 12 12z" fill="#FBBC05"/>
              <path d="M12 24c6.635 0 12-5.365 12-12 0-.788-.085-1.39-.189-1.989H12.24v4.115h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.605 0 0 5.365 0 12s5.605 12 12 12z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
