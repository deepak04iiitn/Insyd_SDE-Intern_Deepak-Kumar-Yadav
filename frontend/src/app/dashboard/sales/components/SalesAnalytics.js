"use client";

import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SalesAnalytics({ analytics, loading, filters, onFilterChange, onRefresh }) {

  const [selectedItem, setSelectedItem] = useState(null);

  if(loading) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="p-8 text-center text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if(!analytics) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="p-8 text-center text-gray-500">No analytics data available</div>
      </div>
    );
  }

  const { summary, salesTrend, itemAnalytics, companyAnalytics, bestPerformingItems, restockingSuggestions } = analytics;

  const filteredItemAnalytics = selectedItem ? itemAnalytics.filter((item) => item.itemName === selectedItem) : itemAnalytics;

  const salesTrendData = salesTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    quantity: item.quantity,
    revenue: item.revenue,
  }));

  const topItemsData = bestPerformingItems.slice(0, 10).map((item) => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + "..." : item.itemName,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
  }));

  const companyData = companyAnalytics.slice(0, 10).map((company) => ({
    name: company.companyName.length > 15 ? company.companyName.substring(0, 15) + "..." : company.companyName,
    revenue: company.totalRevenue,
    quantity: company.totalQuantity,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-4 shadow">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Name (Optional)
            </label>
            <input
              type="text"
              value={filters.itemName}
              onChange={(e) => onFilterChange("itemName", e.target.value)}
              placeholder="Filter by item..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={filters.companyName}
              onChange={(e) => onFilterChange("companyName", e.target.value)}
              placeholder="Filter by company..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Months to Analyze
            </label>
            <select
              value={filters.months}
              onChange={(e) => onFilterChange("months", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
              <option value="24">Last 24 months</option>
            </select>
          </div>

        </div>

        <div className="mt-4">
          <button
            onClick={onRefresh}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Refresh Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ₹{summary.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Quantity Sold</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {summary.totalQuantity.toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Sales</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{summary.totalSales}</div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Average Sale Value</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ₹{summary.avgSaleValue.toFixed(2)}
          </div>
        </div>

      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Sales Trend Over Time</h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="quantity"
                stroke="#8884d8"
                name="Quantity Sold"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Best Performing Items</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            View Analytics For:
          </label>
          <select
            value={selectedItem || ""}
            onChange={(e) => setSelectedItem(e.target.value || null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Items (Combined)</option>
            {itemAnalytics.map((item) => (
              <option key={item.itemName} value={item.itemName}>
                {item.itemName} ({item.companyName})
              </option>
            ))}
          </select>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topItemsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Company Performance</h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Restocking Suggestions</h2>
        <p className="mb-4 text-sm text-gray-600">
          Items that are out of stock or low in stock and have good performance
        </p>

        {restockingSuggestions.length === 0 ? (
          <div className="text-center text-gray-500">No restocking suggestions at this time</div>
        ) : (
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
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sales Velocity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {restockingSuggestions.map((item, index) => (
                  <tr key={index}>

                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.companyName}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.isOutOfStock ? (
                        <span className="text-red-600">Out of Stock</span>
                      ) : (
                        item.currentQuantity
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{item.totalRevenue.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.salesVelocity.toFixed(2)} units/day
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Detailed Analytics: {selectedItem}
          </h2>

          {filteredItemAnalytics.length > 0 && (
            <div className="space-y-4">
              {filteredItemAnalytics.map((item) => (
                <div key={item.itemName} className="rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Quantity Sold</div>
                      <div className="text-lg font-bold text-gray-900">{item.totalQuantity}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{item.totalRevenue.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-500">Sales Velocity</div>
                      <div className="text-lg font-bold text-gray-900">
                        {item.salesVelocity.toFixed(2)} units/day
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-500">Avg Days Between Sales</div>
                      <div className="text-lg font-bold text-gray-900">
                        {item.avgDaysBetweenSales.toFixed(1)} days
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      )}
      
    </div>
  );
}

