"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../lib/store";
import { setupAuthInterceptor } from "../services/authService";
import { setupAdminInterceptor } from "../services/adminService";
import { setupStockInterceptor } from "../services/stockService";
import { setupSalesInterceptor } from "../services/salesService";

setupAuthInterceptor(store);
setupAdminInterceptor(store);
setupStockInterceptor(store);
setupSalesInterceptor(store);

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        } 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
