"use client";

export default function StockTable({ stocks, loading, activeTab, pagination, onPageChange, pendingQuantityChanges, 
  onQuantityChange, onSaveQuantity, onToggleOutOfStock, onEdit, onDelete, onFormatDate, onFormatQuantityType, saving }) {

  if(loading) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="p-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if(stocks.length === 0) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="p-8 text-center text-gray-500">No items found</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="overflow-x-auto">

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">

            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date Added
              </th>

              {activeTab === "available" && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Out of Stock
                </th>
              )}

              {activeTab === "outOfStock" && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date Out of Stock
                </th>
              )}

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>

          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {stocks.map((stock) => (

              <tr key={stock._id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {stock.name}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {activeTab === "available" ? (
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => {
                          const currentQty = pendingQuantityChanges[stock._id] !== undefined 
                            ? pendingQuantityChanges[stock._id] 
                            : stock.quantity;
                          onQuantityChange(stock._id, currentQty - 1);
                        }}
                        disabled={saving || (pendingQuantityChanges[stock._id] !== undefined ? pendingQuantityChanges[stock._id] : stock.quantity) <= 0}
                        className="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>

                      <span className="min-w-[80px] inline-block text-center">
                        {pendingQuantityChanges[stock._id] !== undefined 
                          ? pendingQuantityChanges[stock._id] 
                          : stock.quantity} {onFormatQuantityType(stock.quantityType)}
                      </span>

                      <button
                        onClick={() => {
                          const currentQty = pendingQuantityChanges[stock._id] !== undefined 
                            ? pendingQuantityChanges[stock._id] 
                            : stock.quantity;
                          onQuantityChange(stock._id, currentQty + 1);
                        }}
                        disabled={saving}
                        className="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>

                      {(pendingQuantityChanges[stock._id] !== undefined && 
                        pendingQuantityChanges[stock._id] !== stock.quantity) && (
                        <button
                          onClick={() => onSaveQuantity(stock)}
                          disabled={saving}
                          className="cursor-pointer ml-2 rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          Save
                        </button>
                      )}

                    </div>
                  ) : (
                    <span>
                      {stock.quantity} {onFormatQuantityType(stock.quantityType)}
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {stock.companyName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  ₹{stock.price.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {onFormatDate(stock.expiryDate)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {onFormatDate(stock.dateAdded)}
                </td>

                {activeTab === "available" && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <button
                      onClick={() => onToggleOutOfStock(stock)}
                      disabled={saving}
                      className={`cursor-pointer relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
                        stock.isSoldOut ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                      role="switch"
                      aria-checked={stock.isSoldOut}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          stock.isSoldOut ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                )}

                {activeTab === "outOfStock" && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {onFormatDate(stock.dateOutOfStock)}
                  </td>
                )}

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex gap-2">

                    {activeTab === "available" && (
                      <button
                        onClick={() => onEdit(stock)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(stock)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-900 cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

  
      <Pagination 
        pagination={pagination} 
        onPageChange={onPageChange}
        isOutOfStock={activeTab === "outOfStock"}
      />

    </div>
  );
}

function Pagination({ pagination, onPageChange, isOutOfStock }) {

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">

        <button
          onClick={() => onPageChange(pagination.currentPage - 1, isOutOfStock)}
          disabled={pagination.currentPage === 1}
          className="cursor-pointer relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(pagination.currentPage + 1, isOutOfStock)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="cursor-pointer relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>

      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </p>

        </div>

        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">

            <button
              onClick={() => onPageChange(pagination.currentPage - 1, isOutOfStock)}
              disabled={pagination.currentPage === 1}
              className="cursor-pointer relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              Previous
            </button>

            {pagination.totalPages > 0 && [...Array(pagination.totalPages)].map((_, idx) => {

              const page = idx + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 &&
                  page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page, isOutOfStock)}
                    className={`cursor-pointer relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === pagination.currentPage
                        ? "z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return (
                  <span
                    key={page}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => onPageChange(pagination.currentPage + 1, isOutOfStock)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              Next
            </button>

          </nav>
        </div>

      </div>
    </div>
  );
}

