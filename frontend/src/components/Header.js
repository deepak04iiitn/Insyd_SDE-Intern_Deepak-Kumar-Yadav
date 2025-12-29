"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { usePathname } from "next/navigation";

export default function Header() {

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Invenza</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/stock"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.includes("/stock")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Stock
              </Link>

              <Link
                href="/dashboard/sales"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.includes("/sales")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Sales
              </Link>

              <Link
                href="/dashboard/expiring-soon"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.includes("/expiring-soon")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Expiring Soon
              </Link>

              <Link
                href="/dashboard/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.includes("/reports")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Reports
              </Link>

              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.includes("/admin")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  Admin
                </Link>
              )}

            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex sm:items-center sm:space-x-2">

                <span className="text-sm text-gray-700">
                  {user?.name || "User"}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                    Admin
                  </span>
                )}

              </div>

              <button
                onClick={logout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
              >
                Logout
              </button>

            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

        </div>
      </nav>
    </header>
  );
}

