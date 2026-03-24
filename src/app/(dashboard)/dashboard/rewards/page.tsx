import Link from 'next/link';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mining & Rewards</h1>
            <p className="text-gray-600 mt-1">Track mined coins balance and rewards history.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            This section will show mined coins balance and reward history associated with purchases.
          </p>
        </div>
      </main>
    </div>
  );
}
