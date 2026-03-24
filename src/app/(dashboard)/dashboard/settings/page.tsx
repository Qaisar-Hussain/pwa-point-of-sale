import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Update store details and POS preferences.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            This page will allow updating store name, address, and other POS settings.
          </p>
        </div>
      </main>
    </div>
  );
}
