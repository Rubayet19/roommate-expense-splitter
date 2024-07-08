'use client';

import { useState, useEffect } from 'react';
import { Roommate } from '../dashboard/types/shared';
import Link from 'next/link';

export default function UserProfile() {
  const [user, setUser] = useState<Roommate | null>(null);

  useEffect(() => {
    // Fetch user data here
    // For now, we'll use mock data
    const fetchUser = async () => {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
    };
    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white ">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center text-base text-black font-semibold">
                Home
              </Link>
            </div>
            <div className="flex items-center">
              <button className="bg-black hover:bg-slate-700 text-white text-sm font-semibold py-2 px-3 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Your Account</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <p>{user.name}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <p>{user.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">User ID</label>
            <p>{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}