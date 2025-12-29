"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import * as stockService from "../../../services/stockService";
import { useDispatch } from "react-redux";
import StockFilters from "./components/StockFilters";
import StockTable from "./components/StockTable";
import AddEditStockModal from "./components/AddEditStockModal";
import DeleteStockModal from "./components/DeleteStockModal";

export default function StockPage() {

  const dispatch = useDispatch();
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("available"); // "available" or "outOfStock"
  const [availableStocks, setAvailableStocks] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingQuantityChanges, setPendingQuantityChanges] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);

  // Pagination states
  const [availablePagination, setAvailablePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [outOfStockPagination, setOutOfStockPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter and search states
  const [availableFilters, setAvailableFilters] = useState({
    search: "",
    companyName: "",
    quantityType: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [outOfStockFilters, setOutOfStockFilters] = useState({
    search: "",
    companyName: "",
    quantityType: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "dateOutOfStock",
    sortOrder: "desc",
  });

  // Form state for adding/editing stock
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    quantityType: "numbers",
    companyName: "",
    price: "",
    expiryDate: "",
  });

  
  const fetchAvailableStock = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const params = {
        page: availablePagination.currentPage,
        limit: availablePagination.itemsPerPage,
        ...availableFilters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await stockService.getAvailableStock(params);
      setAvailableStocks(response.data.data.stocks);
      setAvailablePagination(response.data.data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch available stock");
    } finally {
      setLoading(false);
    }

  }, [availablePagination.currentPage, availableFilters]);


  const fetchOutOfStock = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      const params = {
        page: outOfStockPagination.currentPage,
        limit: outOfStockPagination.itemsPerPage,
        ...outOfStockFilters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await stockService.getOutOfStock(params);
      setOutOfStockItems(response.data.data.stocks);
      setOutOfStockPagination(response.data.data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch out of stock items");
    } finally {
      setLoading(false);
    }
  }, [outOfStockPagination.currentPage, outOfStockFilters]);

  
  const fetchInactiveTabCount = useCallback(async (isOutOfStockTab) => {

    try {

      const params = { page: 1, limit: 1 }; 
      const response = isOutOfStockTab
        ? await stockService.getOutOfStock(params)
        : await stockService.getAvailableStock(params);
      
      if(isOutOfStockTab) {
        setOutOfStockPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.pagination.totalItems,
          totalPages: response.data.data.pagination.totalPages,
        }));

      } else {
        setAvailablePagination((prev) => ({
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

        const [availableResponse, outOfStockResponse] = await Promise.all([
          stockService.getAvailableStock({ page: 1, limit: 1 }),
          stockService.getOutOfStock({ page: 1, limit: 1 }),
        ]);
        
        setAvailablePagination((prev) => ({
          ...prev,
          totalItems: availableResponse.data.data.pagination.totalItems,
          totalPages: availableResponse.data.data.pagination.totalPages,
        }));

        setOutOfStockPagination((prev) => ({
          ...prev,
          totalItems: outOfStockResponse.data.data.pagination.totalItems,
          totalPages: outOfStockResponse.data.data.pagination.totalPages,
        }));

      } catch (err) {
        console.error("Failed to fetch initial counts:", err);
      }
    };

    fetchBothCounts();
  }, [authLoading, token]);

  
  useEffect(() => {

    if(authLoading || !token) return;

    if(activeTab === "available") {
      fetchInactiveTabCount(true);
    } else {
      fetchInactiveTabCount(false);
    }
  }, [authLoading, token, activeTab, fetchInactiveTabCount]);

  
  useEffect(() => {

    if(authLoading || !token) return;

    if(activeTab === "available") {
      fetchAvailableStock();
    } else {
      fetchOutOfStock();
    }
  }, [authLoading, token, activeTab, fetchAvailableStock, fetchOutOfStock]);

 
  const handleFilterChange = (filterName, value, isOutOfStock = false) => {

    if(isOutOfStock) {
      setOutOfStockFilters((prev) => ({
        ...prev,
        [filterName]: value,
      }));
      setOutOfStockPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else {
      setAvailableFilters((prev) => ({
        ...prev,
        [filterName]: value,
      }));
      setAvailablePagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };


  const handlePageChange = (page, isOutOfStock = false) => {
    if(isOutOfStock) {
      setOutOfStockPagination((prev) => ({ ...prev, currentPage: page }));
    } else {
      setAvailablePagination((prev) => ({ ...prev, currentPage: page }));
    }
  };


  const resetForm = () => {
    setFormData({
      name: "",
      quantity: "",
      quantityType: "numbers",
      companyName: "",
      price: "",
      expiryDate: "",
    });
    setEditingStock(null);
  };

  
  const handleAddStock = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if(!formData.name || !formData.name.trim() || 
          !formData.quantity || formData.quantity === "" ||
          !formData.quantityType || !formData.quantityType.trim() ||
          !formData.companyName || !formData.companyName.trim() ||
          !formData.price || formData.price === "") {
        setError("Please fill in all required fields");
        setSaving(false);
        return;
      }

      const stockData = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        quantityType: formData.quantityType,
        companyName: formData.companyName.trim(),
        price: parseFloat(formData.price),
      };

      if(isNaN(stockData.quantity) || isNaN(stockData.price)) {
        setError("Quantity and Price must be valid numbers");
        setSaving(false);
        return;
      }

      if(formData.expiryDate && formData.expiryDate.trim() !== "") {
        stockData.expiryDate = new Date(formData.expiryDate);
      }

      await stockService.addStock(stockData);
      setSuccess("Stock item added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchAvailableStock();

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add stock item");
    } finally {
      setSaving(false);
    }
  };

  
  const handleUpdateStock = async (stockId, updates) => {

    try {
      setSaving(true);
      setError(null);

      const stockData = {
        ...updates,
        quantity: updates.quantity !== undefined ? parseFloat(updates.quantity) : undefined,
        price: updates.price !== undefined ? parseFloat(updates.price) : undefined,
        expiryDate: updates.expiryDate ? new Date(updates.expiryDate) : undefined,
      };

      Object.keys(stockData).forEach((key) => {
        if (stockData[key] === undefined) {
          delete stockData[key];
        }
      });

      await stockService.updateStock(stockId, stockData);
      setSuccess("Stock item updated successfully!");
      setEditingStock(null);
      
      if(activeTab === "available") {
        fetchAvailableStock();
      } else {
        fetchOutOfStock();
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update stock item");
    } finally {
      setSaving(false);
    }
  };

  
  const handleEditStock = (stock) => {

    setEditingStock(stock);
    setFormData({
      name: stock.name,
      quantity: stock.quantity.toString(),
      quantityType: stock.quantityType,
      companyName: stock.companyName,
      price: stock.price.toString(),
      expiryDate: stock.expiryDate
        ? new Date(stock.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setShowAddModal(true);
  };

  
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if(editingStock) {
      await handleUpdateStock(editingStock._id, formData);
      setShowAddModal(false);
      resetForm();
    } else {
      await handleAddStock(e);
    }
  };

  
  const handleQuantityChange = (stockId, newQuantity) => {
    if(newQuantity < 0) return;

    setPendingQuantityChanges((prev) => ({
      ...prev,
      [stockId]: newQuantity,
    }));
  };

  
  const handleSaveQuantity = async (stock) => {

    const newQuantity = pendingQuantityChanges[stock._id] !== undefined 
      ? pendingQuantityChanges[stock._id] 
      : stock.quantity;
    
    if(newQuantity < 0) return;
    
    const updates = {
      quantity: newQuantity,
    };

    if(newQuantity === 0) {
      updates.isSoldOut = true;
    }

    setPendingQuantityChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[stock._id];
      return newPending;
    });

    await handleUpdateStock(stock._id, updates);
  };

  
  const handleToggleOutOfStock = async (stock) => {
    const newSoldOutStatus = !stock.isSoldOut;
    
    const updates = {
      isSoldOut: newSoldOutStatus,
    };

    if(newSoldOutStatus) {
      updates.quantity = 0;
    }

    try {
      setSaving(true);
      setError(null);

      const stockData = {
        ...updates,
      };

      await stockService.updateStock(stock._id, stockData);
      setSuccess(`Stock item ${newSoldOutStatus ? "marked as out of stock" : "marked as available"}!`);
      
      await Promise.all([fetchAvailableStock(), fetchOutOfStock()]);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update stock item");
    } finally {
      setSaving(false);
    }
  };

  
  const handleDeleteStock = (stock) => {
    setStockToDelete(stock);
    setShowDeleteModal(true);
  };

  
  const confirmDeleteStock = async () => {

    if(!stockToDelete) return;

    try {

      setSaving(true);
      setError(null);
      await stockService.deleteStock(stockToDelete._id);
      setSuccess("Stock item deleted successfully!");
      setShowDeleteModal(false);
      setStockToDelete(null);
      
      if(activeTab === "available") {
        fetchAvailableStock();
      } else {
        fetchOutOfStock();
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete stock item");
    } finally {
      setSaving(false);
    }
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const currentStocks = activeTab === "available" ? availableStocks : outOfStockItems;
  const currentPagination = activeTab === "available" ? availablePagination : outOfStockPagination;
  const currentFilters = activeTab === "available" ? availableFilters : outOfStockFilters;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              <p className="mt-2 text-gray-600">Manage your inventory items</p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Add New Stock
            </button>
          </div>

          
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
              {success}
              <button
                onClick={() => setSuccess(null)}
                className="ml-4 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}

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
                onClick={() => setActiveTab("available")}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "available"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Available ({availablePagination.totalItems})
              </button>

              <button
                onClick={() => setActiveTab("outOfStock")}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === "outOfStock"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Out of Stock ({outOfStockPagination.totalItems})
              </button>

            </nav>
          </div>

          
          <StockFilters
            filters={currentFilters}
            onFilterChange={(filterName, value) => handleFilterChange(filterName, value, activeTab === "outOfStock")}
            isOutOfStock={activeTab === "outOfStock"}
          />

        
          <StockTable
            stocks={currentStocks}
            loading={loading}
            activeTab={activeTab}
            pagination={currentPagination}
            onPageChange={handlePageChange}
            pendingQuantityChanges={pendingQuantityChanges}
            onQuantityChange={handleQuantityChange}
            onSaveQuantity={handleSaveQuantity}
            onToggleOutOfStock={handleToggleOutOfStock}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
            onFormatDate={formatDate}
            onFormatQuantityType={formatQuantityType}
            saving={saving}
          />
        </div>

        
        <AddEditStockModal
          show={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          onSubmit={handleModalSubmit}
          formData={formData}
          setFormData={setFormData}
          editingStock={editingStock}
          saving={saving}
        />

        
        <DeleteStockModal
          show={showDeleteModal}
          stock={stockToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setStockToDelete(null);
          }}
          onConfirm={confirmDeleteStock}
          saving={saving}
        />
      </div>
    </ProtectedRoute>
  );
}
