import React, { useState } from "react";
import { usePackages } from "../hooks/usePackages";
import PackageDetail from "../components/PackageDetail";
import AlertBanner from "../components/AlertBanner";

const Dashboard = () => {
  const [filter, setFilter] = useState("active");
  const { packages, loading } = usePackages(filter);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

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

  const stuckPackages = packages.filter((pkg) => pkg.isStuck);

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

      {/* Table */}
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
                <th className="px-2 py-2 border hidden sm:table-cell">
                  Last Seen
                </th>
                <th className="px-2 py-2 border hidden md:table-cell">
                  Location
                </th>
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

      {/* Detail View */}
      {selectedPackageId && (
        <PackageDetail
          packageId={selectedPackageId}
          onClose={() => setSelectedPackageId(null)}
        />
      )}
    </div>
  );
};

function timeSince(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "unknown";
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes
  return `${diff}m ago`;
}

export default Dashboard;
