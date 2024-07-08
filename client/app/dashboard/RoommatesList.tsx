// components/RoommatesList.tsx
import React, { useState } from 'react';
import Link from 'next/link';

interface Roommate {
  id: number;
  name: string;
  email: string;
  totalOwed: number;
}

const mockRoommates: Roommate[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', totalOwed: 50 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', totalOwed: -30 },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', totalOwed: 0 },
];

export default function RoommatesList() {
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Roommates</h2>
        <button className="bg-black hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded">
          Add Roommate
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockRoommates.map((roommate) => (
              <tr 
                key={roommate.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedRoommate(roommate)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{roommate.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roommate.email}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  roommate.totalOwed > 0 ? 'text-green-600' : roommate.totalOwed < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {roommate.totalOwed > 0 ? `Owes you $${roommate.totalOwed.toFixed(2)}` :
                   roommate.totalOwed < 0 ? `You owe $${Math.abs(roommate.totalOwed).toFixed(2)}` :
                   'Settled'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRoommate && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Roommate Details</h3>
          <p><strong>Name:</strong> {selectedRoommate.name}</p>
          <p><strong>Email:</strong> {selectedRoommate.email}</p>
          <p><strong>Balance:</strong> 
            <span className={`font-medium ${
              selectedRoommate.totalOwed > 0 ? 'text-green-600' : selectedRoommate.totalOwed < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {selectedRoommate.totalOwed > 0 ? ` Owes you $${selectedRoommate.totalOwed.toFixed(2)}` :
               selectedRoommate.totalOwed < 0 ? ` You owe $${Math.abs(selectedRoommate.totalOwed).toFixed(2)}` :
               ' Settled'}
            </span>
          </p>
          <div className="mt-4">
            <Link href={`/roommates/${selectedRoommate.id}`} className="text-blue-600 hover:underline">
              View Full Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}