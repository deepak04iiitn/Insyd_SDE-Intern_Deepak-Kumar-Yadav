"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import * as salesService from "../../../services/salesService";
import { useDispatch } from "react-redux";
import SalesTable from "./components/SalesTable";
import SalesAnalytics from "./components/SalesAnalytics";
import SalesFilters from "./components/SalesFilters";

export default function SalesPage() {

  const dispatch = useDispatch();
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("table"); // "table" or "analytics"
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
    itemName: "",
    companyName: "",
    startDate: "",
    endDate: "",
    minQuantity: "",
    maxQuantity: "",
    sortBy: "saleDate",
    sortOrder: "desc",
  });

  const [analyticsFilters, setAnalyticsFilters] = useState({
    itemName: "",
    companyName: "",
    months: "12",
  });

  
  const fetchSales = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if(params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await salesService.getSales(params);
      setSales(response.data.data.sales);
      setPagination(response.data.data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  
  const fetchAnalytics = useCallback(async () => {

    try {

      setAnalyticsLoading(true);
      setError(null);

      const params = {
        ...analyticsFilters,
      };

      Object.keys(params).forEach((key) => {
        if(params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await salesService.getSalesAnalytics(params);
      setAnalytics(response.data.data);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsFilters]);


  useEffect(() => {
    if(authLoading || !token) return;
    if(activeTab === "table") {
      fetchSales();
    }
  }, [authLoading, token, activeTab, fetchSales]);

  
  useEffect(() => {
    if(authLoading || !token) return;
    if(activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [authLoading, token, activeTab, fetchAnalytics]);


  const handleFilterChange = (filterName, value) => {

    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

  };


  const handleAnalyticsFilterChange = (filterName, value) => {
    setAnalyticsFilters((prev) => ({ ...prev, [filterName]: value }));
  };


  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };


  const formatDate = (dateString) => {

    if(!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  };


  if(authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
            <p className="mt-2 text-gray-600">View sales data and analytics</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">

              <button
                onClick={() => setActiveTab("table")}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "table"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Sales Table
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "analytics"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Analytics
              </button>

            </nav>
          </div>

          {activeTab === "table" && (
            <>
              <SalesFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
              <SalesTable
                sales={sales}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onFormatDate={formatDate}
              />
            </>
          )}

          {activeTab === "analytics" && (
            <SalesAnalytics
              analytics={analytics}
              loading={analyticsLoading}
              filters={analyticsFilters}
              onFilterChange={handleAnalyticsFilterChange}
              onRefresh={fetchAnalytics}
            />
          )}
        </div>
        
      </div>
    </ProtectedRoute>
  );
}

