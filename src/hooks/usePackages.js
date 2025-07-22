import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

const STUCK_THRESHOLD_MINUTES = 30;

export function usePackages(status = "active") {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        status === "all"
          ? "https://courier-tracker-backend-x3hy.onrender.com/api/packages/all"
          : "https://courier-tracker-backend-x3hy.onrender.com/api/packages/active";

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      const now = new Date();
      const packagesWithStuckFlag = data.map((pkg) => {
  const lastUpdatedRaw = pkg.last_updated || pkg.lastUpdated;
  const lastUpdated = new Date(lastUpdatedRaw);

  if (isNaN(lastUpdated.getTime())) {
    // Invalid or missing date — fallback to avoid NaN diff
    return {
      ...pkg,
      isStuck: false,
      last_seen_text: 'unknown',
    };
  }

  const diffMinutes = (now - lastUpdated) / 1000 / 60;
  return {
    ...pkg,
    isStuck: diffMinutes > STUCK_THRESHOLD_MINUTES,
    last_seen_text: `${Math.floor(diffMinutes)} min ago`,
  };
});


      setPackages(packagesWithStuckFlag);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    const interval = setInterval(fetchPackages, 15000);
    return () => clearInterval(interval);
  }, [status]);

  // 👇 Handle real-time updates
  useSocket((updated) => {
  setPackages((prev) => {
    const updatedIndex = prev.findIndex((p) => p.package_id === updated.package_id);
    const now = new Date();
    const updatedDate = new Date(updated.event_timestamp);
    const isDateValid = !isNaN(updatedDate.getTime());
    
    const diffMinutes = isDateValid ? (now - updatedDate) / 1000 / 60 : null;

    const updatedPackage = {
      ...updated,
      isStuck: isDateValid ? diffMinutes > STUCK_THRESHOLD_MINUTES : false,
      last_updated: updated.event_timestamp,
      last_seen_text: isDateValid ? `${Math.floor(diffMinutes)} min ago` : "unknown",
    };

    if (updatedIndex >= 0) {
      const updatedList = [...prev];
      updatedList[updatedIndex] = updatedPackage;
      return updatedList;
    } else {
      return [updatedPackage, ...prev];
    }
    

  });
});


  return { packages, loading };
}
