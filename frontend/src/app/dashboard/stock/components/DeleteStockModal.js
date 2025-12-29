"use client";

export default function DeleteStockModal({ show, stock, onClose, onConfirm, saving }) {

  if(!show || !stock) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">

        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>

        <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-bold text-center text-gray-900">
            Delete Stock Item
          </h2>

          <p className="mb-6 text-center text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{stock.name}"</span>? This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

