"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, requireAdmin = false }) {

  const router = useRouter();
  const { isAuthenticated, user, isLoading, token } = useSelector((state) => state.auth);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Small delay to ensure Redux Persist has rehydrated
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only check after initial delay and when not loading
    if(hasChecked && !isLoading) {
      // Check if user has token (more reliable than isAuthenticated flag)
      if(!token) {
        router.push("/login");
        return;
      }

      // Check admin requirement
      if(requireAdmin && user?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, token, router, requireAdmin, hasChecked]);

  // Show loading while checking auth or waiting for rehydration
  if(!hasChecked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If no token, don't render (will redirect)
  if(!token) {
    return null;
  }

  // If admin required but not admin, don't render (will redirect)
  if(requireAdmin && user?.role !== "admin") {
    return null;
  }

  return children;
  
}

