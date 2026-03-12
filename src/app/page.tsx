import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to POS System</h1>
        <p className="text-lg mb-8 text-gray-700">Point of Sale Management System</p>
        <div className="space-x-4">
          <Link href="/login" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Login
          </Link>
          <Link href="/signup" className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
