"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import * as reportService from "../../../services/reportService";

export default function ReportsPage() {
  
  const { user, token, isLoading: authLoading } = useAuth();
  const [periodType, setPeriodType] = useState("months"); 
  const [periodValue, setPeriodValue] = useState("3"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);


  const handleGenerateReport = async () => {

    try {

      setLoading(true);
      setError(null);
      setSuccess(null);

      const params = {
        periodType,
        ...(periodType === "months" && { periodValue }),
      };

      const response = await reportService.generateReport(params);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const periodLabel = periodType === "weekly" ? "week" : `${periodValue || 3}months`;

      link.download = `inventory-report-${periodLabel}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Report generated successfully! Download started.`);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewData = async () => {

    try {

      setPreviewLoading(true);
      setError(null);

      const params = {
        periodType,
        ...(periodType === "months" && { periodValue }),
      };

      const response = await reportService.getReportData(params);
      setReportData(response.data.data);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch report data");
    } finally {
      setPreviewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
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
            <h1 className="text-3xl font-bold text-gray-900">Report Generation</h1>
            <p className="mt-2 text-gray-600">
              Generate comprehensive PDF reports for inventory analysis and sales performance
            </p>
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

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Report Configuration</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Period Type
                </label>
                <select
                  value={periodType}
                  onChange={(e) => {
                    setPeriodType(e.target.value);
                    setReportData(null);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="weekly">Weekly Report</option>
                  <option value="months">Monthly Report</option>
                </select>
              </div>

              {periodType === "months" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Months
                  </label>
                  <select
                    value={periodValue}
                    onChange={(e) => {
                      setPeriodValue(e.target.value);
                      setReportData(null);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="1">Last 1 Month</option>
                    <option value="3">Last 3 Months</option>
                    <option value="6">Last 6 Months</option>
                    <option value="12">Last 12 Months</option>
                    <option value="24">Last 24 Months</option>
                  </select>
                </div>
              )}

              {periodType === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Information
                  </label>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    Weekly report will analyze the last 7 days of data
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handlePreviewData}
                disabled={previewLoading}
                className="rounded-md bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {previewLoading ? "Loading Preview..." : "Preview Report Data"}
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating PDF...
                  </span>
                ) : (
                  "📄 Generate PDF Report"
                )}
              </button>
            </div>
          </div>

          {reportData && (
            <div className="mt-8 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Report Preview</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">Summary Statistics</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                    <div className="rounded-lg bg-indigo-50 p-4">
                      <div className="text-sm font-medium text-indigo-600">Total Revenue</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(reportData.summary.totalRevenue)}
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="text-sm font-medium text-green-600">Total Quantity Sold</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {reportData.summary.totalQuantity.toFixed(2)}
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="text-sm font-medium text-blue-600">Total Sales</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {reportData.summary.totalSales}
                      </div>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                      <div className="text-sm font-medium text-purple-600">Average Sale Value</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(reportData.summary.avgSaleValue)}
                      </div>
                    </div>

                  </div>
                </div>

                {reportData.peakDay && reportData.peakDay.date && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">📈 Peak Sales Day</h4>

                    <p className="text-sm text-gray-700">
                      <strong>Date:</strong> {formatDate(reportData.peakDay.date)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Revenue:</strong> {formatCurrency(reportData.peakDay.revenue)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Quantity Sold:</strong> {reportData.peakDay.quantity.toFixed(2)}
                    </p>

                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">Top 5 Best Performing Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">

                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Item Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.bestPerformingItems.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.itemName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.companyName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.totalRevenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.totalQuantity.toFixed(2)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.isOutOfStock ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Available
                                </span>
                              )}
                            </td>

                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </div>
                </div>

                {reportData.restockingSuggestions.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Restocking Suggestions</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">

                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Item Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Current Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Revenue
                            </th>
                          </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.restockingSuggestions.slice(0, 5).map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.itemName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.companyName}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.isOutOfStock ? (
                                  <span className="text-red-600">Out of Stock</span>
                                ) : (
                                  item.currentQuantity
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.totalRevenue)}
                              </td>
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Report Information</h4>

                  <p className="text-sm text-gray-700">
                    <strong>Period:</strong>{" "}
                    {periodType === "weekly"
                      ? "Last Week"
                      : `Last ${periodValue} Months`}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>Date Range:</strong> {formatDate(reportData.period.startDate)} to{" "}
                    {formatDate(reportData.period.endDate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click "Generate PDF Report" to download the complete report with all details,
                    charts, and recommendations.
                  </p>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

