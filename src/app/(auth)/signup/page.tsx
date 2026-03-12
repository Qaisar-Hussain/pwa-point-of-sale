import type { Metadata } from 'next';
import { SignupForm } from '@/components/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account | POS SaaS',
  description: 'Create a new POS account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to start using POS</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
