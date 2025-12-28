"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
import * as adminService from "../../../services/adminService";

export default function AdminPage() {

  const { user: currentUser, isAdmin, token, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "all"

  const fetchUsers = useCallback(async () => {
    
    if(!currentUser || currentUser.role !== "admin") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [allUsersResponse, pendingUsersResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getPendingUsers(),
      ]);

      setUsers(allUsersResponse.data.data.users);
      setPendingUsers(pendingUsersResponse.data.data.users);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    
    if(authLoading) {
      return;
    }

    if(currentUser && currentUser.role === "admin") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [authLoading, currentUser, fetchUsers]);

  const handleApprove = async (email) => {
    try {

      setError(null);
      setSuccess(null);

      await adminService.approveUser(email);
      setSuccess(`User ${email} has been approved successfully`);
      fetchUsers(); 

    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async (email) => {
    try {

      setError(null);
      setSuccess(null);

      await adminService.rejectUser(email);
      setSuccess(`User ${email} approval has been revoked`);
      fetchUsers(); 

    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject user");
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">
              Manage user accounts and approvals
            </p>
          </div>

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">

              <button
                onClick={() => setActiveTab("pending")}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === "pending"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Pending Approval ({pendingUsers.length})
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === "all"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                All Users ({users.length})
              </button>

            </nav>
          </div>

          {(loading || authLoading || !currentUser) ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">Loading...</div>
            </div>
          ) : activeTab === "pending" ? (
            <div className="rounded-lg bg-white shadow">
              {pendingUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No pending users</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {pendingUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => handleApprove(user.email)}
                              className="mr-2 rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.email)}
                              className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow">
              {users.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                user.isApproved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.isApproved ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            {!user.isApproved && user.role !== "admin" && (
                              <button
                                onClick={() => handleApprove(user.email)}
                                className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500"
                              >
                                Approve
                              </button>
                            )}
                            {user.isApproved && user.role !== "admin" && (
                              <button
                                onClick={() => handleReject(user.email)}
                                className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
    </ProtectedRoute>
  );
}

