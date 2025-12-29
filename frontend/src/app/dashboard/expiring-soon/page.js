"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import * as expiringSoonService from "../../../services/expiringSoonService";
import ExpiringSoonFilters from "./components/ExpiringSoonFilters";
import ExpiringSoonTable from "./components/ExpiringSoonTable";

export default function ExpiringSoonPage() {

  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("expiringSoon"); // "expiringSoon" or "expired"
  const [expiringSoonStocks, setExpiringSoonStocks] = useState([]);
  const [expiredStocks, setExpiredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expiringSoonPagination, setExpiringSoonPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [expiredPagination, setExpiredPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [expiringSoonFilters, setExpiringSoonFilters] = useState({
    search: "",
    companyName: "",
    quantityType: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "expiryDate",
    sortOrder: "asc",
  });

  const [expiredFilters, setExpiredFilters] = useState({
    search: "",
    companyName: "",
    quantityType: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "dateExpired",
    sortOrder: "desc",
  });

  
  const fetchExpiringSoon = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const params = {
        page: expiringSoonPagination.currentPage,
        limit: expiringSoonPagination.itemsPerPage,
        ...expiringSoonFilters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await expiringSoonService.getExpiringSoon(params);
      setExpiringSoonStocks(response.data.data.stocks);
      setExpiringSoonPagination(response.data.data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch expiring soon items");
    } finally {
      setLoading(false);
    }

  }, [expiringSoonPagination.currentPage, expiringSoonFilters]);


  const fetchExpired = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const params = {
        page: expiredPagination.currentPage,
        limit: expiredPagination.itemsPerPage,
        ...expiredFilters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await expiringSoonService.getExpired(params);
      setExpiredStocks(response.data.data.stocks);
      setExpiredPagination(response.data.data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch expired items");
    } finally {
      setLoading(false);
    }
  }, [expiredPagination.currentPage, expiredFilters]);

  
  const fetchInactiveTabCount = useCallback(async (isExpiredTab) => {

    try {

      const params = { page: 1, limit: 1 }; 
      const response = isExpiredTab ? await expiringSoonService.getExpired(params) 
        : await expiringSoonService.getExpiringSoon(params);
      
      if(isExpiredTab) {
        setExpiredPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.pagination.totalItems,
          totalPages: response.data.data.pagination.totalPages,
        }));

      } else {
        setExpiringSoonPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.pagination.totalItems,
          totalPages: response.data.data.pagination.totalPages,
        }));
      }

    } catch (err) {
      console.error("Failed to fetch count:", err);
    }
  }, []);

  
  useEffect(() => {

    if(authLoading || !token) return;

    const fetchBothCounts = async () => {

      try {

        const [expiringSoonResponse, expiredResponse] = await Promise.all([
          expiringSoonService.getExpiringSoon({ page: 1, limit: 1 }),
          expiringSoonService.getExpired({ page: 1, limit: 1 }),
        ]);
        
        setExpiringSoonPagination((prev) => ({
          ...prev,
          totalItems: expiringSoonResponse.data.data.pagination.totalItems,
          totalPages: expiringSoonResponse.data.data.pagination.totalPages,
        }));

        setExpiredPagination((prev) => ({
          ...prev,
          totalItems: expiredResponse.data.data.pagination.totalItems,
          totalPages: expiredResponse.data.data.pagination.totalPages,
        }));

      } catch (err) {
        console.error("Failed to fetch initial counts:", err);
      }
    };

    fetchBothCounts();
  }, [authLoading, token]);

  
  useEffect(() => {

    if(authLoading || !token) return;

    if(activeTab === "expiringSoon") {
      fetchInactiveTabCount(true);
    } else {
      fetchInactiveTabCount(false);
    }
  }, [authLoading, token, activeTab, fetchInactiveTabCount]);

  
  useEffect(() => {

    if(authLoading || !token) return;

    if(activeTab === "expiringSoon") {
      fetchExpiringSoon();
    } else {
      fetchExpired();
    }
  }, [authLoading, token, activeTab, fetchExpiringSoon, fetchExpired]);

 
  const handleFilterChange = (filterName, value, isExpired = false) => {

    if(isExpired) {

      setExpiredFilters((prev) => ({ ...prev, [filterName]: value }));
      setExpiredPagination((prev) => ({ ...prev, currentPage: 1 }));

    } else {
      setExpiringSoonFilters((prev) => ({ ...prev, [filterName]: value }));
      setExpiringSoonPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };


  const handlePageChange = (page, isExpired = false) => {

    if(isExpired) {
      setExpiredPagination((prev) => ({ ...prev, currentPage: page }));
    } else {
      setExpiringSoonPagination((prev) => ({ ...prev, currentPage: page }));
    }
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

  
  const formatQuantityType = (quantityType) => {
    return quantityType === "numbers" ? "pieces" : quantityType;
  };

  if(authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const currentStocks = activeTab === "expiringSoon" ? expiringSoonStocks : expiredStocks;
  const currentPagination = activeTab === "expiringSoon" ? expiringSoonPagination : expiredPagination;
  const currentFilters = activeTab === "expiringSoon" ? expiringSoonFilters : expiredFilters;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Expiring Soon & Expired Items</h1>
            <p className="mt-2 text-gray-600">Monitor items that are expiring soon or have expired</p>
          </div>

          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
              {error}
              <button
                onClick={() => setError(null)}
                className="cursor-pointer ml-4 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">

              <button
                onClick={() => setActiveTab("expiringSoon")}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "expiringSoon"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                ⚠️ Expiring Soon ({expiringSoonPagination.totalItems})
              </button>

              <button
                onClick={() => setActiveTab("expired")}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "expired"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                🚨 Expired ({expiredPagination.totalItems})
              </button>

            </nav>
          </div>

          
          <ExpiringSoonFilters
            filters={currentFilters}
            onFilterChange={(filterName, value) => handleFilterChange(filterName, value, activeTab === "expired")}
            isExpired={activeTab === "expired"}
          />

        
          <ExpiringSoonTable
            stocks={currentStocks}
            loading={loading}
            activeTab={activeTab}
            pagination={currentPagination}
            onPageChange={handlePageChange}
            onFormatDate={formatDate}
            onFormatQuantityType={formatQuantityType}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

