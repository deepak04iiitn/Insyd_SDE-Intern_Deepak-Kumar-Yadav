"use client";

import Link from "next/link";

export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-lg font-bold text-indigo-600 mb-2">Invenza</h3>
            <p className="text-sm text-gray-600">
              Inventory Management System - Streamline your inventory operations with ease.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">

              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/stock"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Stock Management
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/sales"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Sales
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/reports"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Reports
                </Link>
              </li>
              
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Help Center
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Documentation
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>

            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Invenza. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

