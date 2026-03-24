'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Box,
  Layers,
  ClipboardList,
  Users,
  BarChart2,
  Gift,
  Settings,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
}

const POS_MODULES = [
  {
    title: 'New Sale',
    description: 'Start a new sale and add items to the cart.',
    href: '/dashboard/new-sale',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    title: 'Products',
    description: 'Manage products, pricing, and barcodes.',
    href: '/dashboard/products',
    icon: Box,
    color: 'bg-emerald-500',
  },
  {
    title: 'Inventory',
    description: 'View stock levels and adjust quantities.',
    href: '/dashboard/inventory',
    icon: Layers,
    color: 'bg-indigo-500',
  },
  {
    title: 'Sales History',
    description: 'Browse past transactions and receipts.',
    href: '/dashboard/sales-history',
    icon: ClipboardList,
    color: 'bg-sky-500',
  },
  {
    title: 'Customers',
    description: 'Manage customers and view purchase history.',
    href: '/dashboard/customers',
    icon: Users,
    color: 'bg-fuchsia-500',
  },
  {
    title: 'Reports',
    description: 'View daily and monthly sales totals.',
    href: '/dashboard/reports',
    icon: BarChart2,
    color: 'bg-yellow-500',
  },
  {
    title: 'Mining & Rewards',
    description: 'Track mined coins and rewards history.',
    href: '/dashboard/rewards',
    icon: Gift,
    color: 'bg-rose-500',
  },
  {
    title: 'Settings',
    description: 'Update store details and POS preferences.',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'bg-slate-600',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome to your POS System</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome, {user.email}! 👋
          </h2>
          <p className="text-gray-600">
            You are now logged in. Use the modules below to manage your store.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-gray-900 font-medium text-sm font-mono">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-gray-900 font-medium">
                  <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                    {user.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* POS Modules */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              POS Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POS_MODULES.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="group block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`${module.color} text-white rounded-lg p-2 inline-flex`}
                        >
                          <Icon size={18} />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {module.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-300 group-hover:text-gray-500 transition">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
