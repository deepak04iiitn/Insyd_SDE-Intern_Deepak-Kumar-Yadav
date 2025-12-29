"use client";

export default function ExpiringSoonFilters({ filters, onFilterChange, isExpired = false }) {

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">

        <input
          type="text"
          placeholder="Search by name or company..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Company name..."
          value={filters.companyName}
          onChange={(e) => onFilterChange("companyName", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <select
          value={filters.quantityType}
          onChange={(e) => onFilterChange("quantityType", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="numbers">Numbers</option>
          <option value="kg">Kg</option>
          <option value="liters">Liters</option>
          <option value="boxes">Boxes</option>
          <option value="pieces">Pieces</option>
          <option value="units">Units</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => onFilterChange("minPrice", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange("maxPrice", e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            onFilterChange("sortBy", sortBy);
            onFilterChange("sortOrder", sortOrder);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="expiryDate-asc">Expiry (Soon-Later)</option>
          <option value="expiryDate-desc">Expiry (Later-Soon)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
          <option value="quantity-asc">Quantity (Low-High)</option>
          <option value="quantity-desc">Quantity (High-Low)</option>
          <option value="dateAdded-asc">Date Added (Old-New)</option>
          <option value="dateAdded-desc">Date Added (New-Old)</option>
          {isExpired && (
            <>
              <option value="dateExpired-asc">Date Expired (Old-New)</option>
              <option value="dateExpired-desc">Date Expired (New-Old)</option>
            </>
          )}
        </select>
        
      </div>
    </div>
  );
}

