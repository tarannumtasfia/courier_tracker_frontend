import React, { useState } from "react";
import { usePackages } from "../hooks/usePackages";
import PackageDetail from "../components/PackageDetail";
import AlertBanner from "../components/AlertBanner";

const Dashboard = () => {
  const [filter, setFilter] = useState("active");
  const { packages, loading, refetch } = usePackages(filter);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  // Create form state
  const [newPackage, setNewPackage] = useState({
    package_id: "",
    lat: "",
    lon: "",
    eta: "",
    note: ""
  });
  const [createStatus, setCreateStatus] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Filter packages based on search and statusFilter
  const filteredPackages = packages.filter((pkg) => {
    if (
      searchTerm &&
      !pkg.package_id.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (
      statusFilter !== "all" &&
      pkg.status.toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  // Packages flagged as stuck
  const stuckPackages = packages.filter((pkg) => pkg.isStuck);

  // Input change handler for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPackage((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler to create a new package
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setCreateStatus(null);

    if (!newPackage.package_id || !newPackage.lat || !newPackage.lon) {
      setCreateStatus({
        error: "Package ID, Latitude, and Longitude are required."
      });
      return;
    }

    setLoadingCreate(true);

    try {
      const response = await fetch("https://courier-tracker-backend-x3hy.onrender.com/api/packages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: newPackage.package_id,
          lat: parseFloat(newPackage.lat),
          lon: parseFloat(newPackage.lon),
          eta: newPackage.eta || null,
          note: newPackage.note || null
        })
      });

      if (!response.ok) {
        let errMsg = "Failed to create package";
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      setCreateStatus({ success: "Package created successfully!" });
      setNewPackage({ package_id: "", lat: "", lon: "", eta: "", note: "" });
      if (refetch) refetch();

      // Optional: reset filters so new package is shown
      setFilter("all");
      setStatusFilter("all");
      setSearchTerm("");
    } catch (err) {
      setCreateStatus({ error: err.message });
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
        Aamira Package Tracker
      </h1>

      {stuckPackages.length > 0 && (
        <AlertBanner message="⚠️ Warning: Some packages have been stuck for over 30 minutes!" />
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center mb-4 gap-2 md:gap-4">
        <select
          className="border p-2 rounded w-full md:w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">Active Packages</option>
          <option value="all">All Packages</option>
        </select>

        <input
          type="text"
          placeholder="Search by Package ID"
          className="border p-2 rounded w-full md:max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full md:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Create Package Form */}
      <form
        onSubmit={handleCreatePackage}
        className="mb-6 p-4 border rounded bg-gray-50 max-w-md"
      >
        <h2 className="text-lg font-semibold mb-2">Create New Package</h2>
        <input
          type="text"
          name="package_id"
          placeholder="Package ID"
          value={newPackage.package_id}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mb-2"
          required
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          value={newPackage.lat}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mb-2"
          required
        />
        <input
          type="number"
          step="any"
          name="lon"
          placeholder="Longitude"
          value={newPackage.lon}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mb-2"
          required
        />
        <input
          type="text"
          name="eta"
          placeholder="ETA (optional)"
          value={newPackage.eta}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="text"
          name="note"
          placeholder="Note (optional)"
          value={newPackage.note}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mb-4"
        />
        <button
          type="submit"
          disabled={loadingCreate}
          className={`px-4 py-2 rounded ${
            loadingCreate
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loadingCreate ? "Creating..." : "Create Package"}
        </button>

        {createStatus?.error && (
          <p className="text-red-600 mt-2">{createStatus.error}</p>
        )}
        {createStatus?.success && (
          <p className="text-green-600 mt-2">{createStatus.success}</p>
        )}
      </form>

      {/* Packages Table */}
      {loading ? (
        <p>Loading packages...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-2 py-2 border">#</th>
                <th className="px-2 py-2 border">Package ID</th>
                <th className="px-2 py-2 border">Status</th>
                <th className="px-2 py-2 border hidden sm:table-cell">Last Seen</th>
                <th className="px-2 py-2 border hidden md:table-cell">Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No packages found.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg, idx) => (
                  <tr
                    key={pkg.package_id}
                    onClick={() => setSelectedPackageId(pkg.package_id)}
                    className={`${
                      pkg.isStuck ? "bg-red-100" : ""
                    } border-b hover:bg-blue-50 cursor-pointer`}
                  >
                    <td className="px-2 py-2 border">{idx + 1}</td>
                    <td className="px-2 py-2 border break-words max-w-[120px]">
                      {pkg.package_id}
                    </td>
                    <td className="px-2 py-2 border">{pkg.status}</td>
                    <td className="px-2 py-2 border hidden sm:table-cell">
                      {timeSince(pkg.last_updated || pkg.lastUpdated)}
                    </td>
                    <td className="px-2 py-2 border hidden md:table-cell">
                      {pkg.lat && pkg.lon ? `${pkg.lat}, ${pkg.lon}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Detail View */}
      {selectedPackageId && (
        <PackageDetail
          packageId={selectedPackageId}
          onClose={() => setSelectedPackageId(null)}
        />
      )}
    </div>
  );
};

// Helper to show relative time in minutes ago
function timeSince(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "unknown";
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes difference
  return `${diff}m ago`;
}

export default Dashboard;
