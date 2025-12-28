"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "../../components/ProtectedRoute";
import { getMe } from "../../lib/slices/authSlice";

export default function DashboardLayout({ children }) {
  
  const dispatch = useDispatch();
  const { token, user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if(token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]); 

  return (
    <ProtectedRoute>
      <div>
        {children}
      </div>
    </ProtectedRoute>
  );
}
  