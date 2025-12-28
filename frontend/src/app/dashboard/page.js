"use client";

import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { getMe } from "../../lib/slices/authSlice";

export default function DashboardPage() {

  const dispatch = useDispatch();
  const { user, logout, isAdmin, token, isLoading } = useAuth();

  useEffect(() => {
    // Fetch user data if token exists but user data is missing
    if(token && !user && !isLoading) {
      dispatch(getMe());
    }
  }, [token, user, isLoading, dispatch]);

  // Show loading state while fetching user data
  if(isLoading && !user && token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.name || "User"}!
            </p>
            {isAdmin && (
              <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                Admin
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Logout
          </button>

        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/dashboard/stock"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Stock</h3>
              <p className="mt-1 text-sm text-gray-600">Manage inventory</p>
            </a>
            <a
              href="/dashboard/sales"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Sales</h3>
              <p className="mt-1 text-sm text-gray-600">View sales data</p>
            </a>
            <a
              href="/dashboard/expiring-soon"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Expiring Soon</h3>
              <p className="mt-1 text-sm text-gray-600">Check expiring items</p>
            </a>
            <a
              href="/dashboard/reports"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Reports</h3>
              <p className="mt-1 text-sm text-gray-600">Generate reports</p>
            </a>
          </div>
        </div>
        
      </div>
    </div>
  );
}

