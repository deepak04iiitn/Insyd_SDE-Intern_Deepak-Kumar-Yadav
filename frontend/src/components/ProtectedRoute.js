"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../lib/slices/authSlice";


export default function ProtectedRoute({ children, requireAdmin = false }) {

  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, token } = useSelector((state) => state.auth);


  useEffect(() => {
    if(token && !user && !isLoading) {
      console.log("ProtectedRoute: Fetching user data with token");
      dispatch(getMe()).catch((error) => {
        console.error("ProtectedRoute: Failed to fetch user data:", error);
      });
    }
  }, [token, user, isLoading, dispatch]);

  useEffect(() => {
    
    if(isLoading) {
      return;
    }

    if(!token) {
      // console.log("ProtectedRoute: No token found, redirecting to login");
      router.push("/login");
      return;
    }

    if(token && !user && !isLoading) {
      // console.log("ProtectedRoute: Token exists but no user data, redirecting to login");
      router.push("/login");
      return;
    }

    if(requireAdmin && user && user.role !== "admin") {
      // console.log("ProtectedRoute: User is not admin, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }
  }, [token, user, isLoading, router, requireAdmin]);


  if(isLoading || (token && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if(!token) {
    return null;
  }

  if(!user) {
    return null;
  }

  if(requireAdmin && user.role !== "admin") {
    return null;
  }

  if(!requireAdmin && user.role !== "admin" && !user.isApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg text-center">

          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mb-6 text-gray-600">
            Your account is currently pending admin approval. Please contact the administrator to grant you access to the dashboard.
          </p>
          <p className="text-sm text-gray-500">
            You will be able to access all features once your account has been approved.
          </p>
        </div>
      </div>
    );
  }

  return children;
  
}

