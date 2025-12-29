"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { getMe } from "../../lib/slices/authSlice";
import * as salesService from "../../services/salesService";
import * as stockService from "../../services/stockService";
import * as expiringSoonService from "../../services/expiringSoonService";

export default function DashboardPage() {

  const dispatch = useDispatch();
  const { user, logout, isAdmin, token, isLoading } = useAuth();

  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalStockItems: 0,
    outOfStockItems: 0,
    expiringSoonItems: 0,
    avgSaleValue: 0,
    totalQuantitySold: 0,
  });

  const [bestPerformingItems, setBestPerformingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(token && !user && !isLoading) {
      dispatch(getMe());
    }
  }, [token, user, isLoading, dispatch]);


  useEffect(() => {
    if(token && !isLoading) {
      fetchDashboardData();
    }
  }, [token, isLoading]);


  const fetchDashboardData = async () => {

    try {

      setLoading(true);
      setError(null);

      const salesAnalyticsPromise = salesService.getSalesAnalytics({ months: 3 });
      
      const availableStockPromise = stockService.getAvailableStock({ page: 1, limit: 1 });
      const outOfStockPromise = stockService.getOutOfStock({ page: 1, limit: 1 });
      
      const expiringSoonPromise = expiringSoonService.getExpiringSoon({ page: 1, limit: 1 });

      const [salesData, availableStockData, outOfStockData, expiringSoonData] = await Promise.all([
        salesAnalyticsPromise,
        availableStockPromise,
        outOfStockPromise,
        expiringSoonPromise,
      ]);

      const salesSummary = salesData.data?.data?.summary || {};
      const bestItems = salesData.data?.data?.bestPerformingItems || [];

      setDashboardStats({
        totalRevenue: salesSummary.totalRevenue || 0,
        totalSales: salesSummary.totalSales || 0,
        totalStockItems: (availableStockData.data?.data?.pagination?.totalItems || 0) + 
                         (outOfStockData.data?.data?.pagination?.totalItems || 0),
        outOfStockItems: outOfStockData.data?.data?.pagination?.totalItems || 0,
        expiringSoonItems: expiringSoonData.data?.data?.pagination?.totalItems || 0,
        avgSaleValue: salesSummary.avgSaleValue || 0,
        totalQuantitySold: salesSummary.totalQuantity || 0,
      });

      setBestPerformingItems(bestItems.slice(0, 5));

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

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
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                  Admin
                </span>
                <Link
                  href="/dashboard/admin"
                  className="inline-block rounded-md bg-indigo-600 px-4 py-1 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Manage Users
                </Link>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : formatCurrency(dashboardStats.totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-indigo-100">Last 3 months</p>
              </div>
              <div className="rounded-full bg-indigo-400/20 p-3">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Sales</p>
                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : dashboardStats.totalSales.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-green-100">Transactions</p>
              </div>
              <div className="rounded-full bg-green-400/20 p-3">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Stock Items</p>
                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : dashboardStats.totalStockItems.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-blue-100">Total inventory</p>
              </div>
              <div className="rounded-full bg-blue-400/20 p-3">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Sale Value</p>
                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : formatCurrency(dashboardStats.avgSaleValue)}
                </p>
                <p className="mt-1 text-xs text-purple-100">Per transaction</p>
              </div>
              <div className="rounded-full bg-purple-400/20 p-3">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.outOfStockItems}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.expiringSoonItems}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-teal-100 p-3">
                <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quantity Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : dashboardStats.totalQuantitySold.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Top Performing Items
              </h2>
              <Link
                href="/dashboard/sales"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : bestPerformingItems.length > 0 ? (
              <div className="space-y-3">
                {bestPerformingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">

                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                      </div>

                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.companyName}</p>
                      </div>

                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalRevenue)}</p>
                      <p className="text-xs text-gray-500">{item.totalQuantity.toFixed(2)} sold</p>
                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No sales data available</div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Navigation
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/dashboard/stock"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">Stock Management</h3>
                  <p className="text-sm text-gray-600">Manage your inventory</p>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/dashboard/sales"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600">Sales Analytics</h3>
                  <p className="text-sm text-gray-600">Analyze sales performance</p>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/dashboard/expiring-soon"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-yellow-600">Expiring Soon</h3>
                  <p className="text-sm text-gray-600">Check items expiring soon</p>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/dashboard/reports"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Reports</h3>
                  <p className="text-sm text-gray-600">Generate PDF reports</p>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}

