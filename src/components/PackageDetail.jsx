// src/components/PackageDetail.jsx
import React, { useEffect, useState } from "react";

const PackageDetail = ({ packageId, onClose }) => {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

 useEffect(() => {
  async function fetchHistory(packageId) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    try {
      const response = await fetch(`https://courier-tracker-backend-x3hy.onrender.com/api/packages/${packageId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        console.error('Fetch error:', response.status, text);
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data = JSON.parse(text); // parse manually so we can log raw content
      setHistory(data);
    } catch (err) {
      console.error('Error fetching package history:', err);
    }
  }

  if (packageId) {
    fetchHistory(packageId);
  }
}, [packageId]);



  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg relative">
        <button
          className="absolute top-2 right-4 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-6">
          Package History: {packageId}
        </h2>

        <div className="relative border-l-2 border-blue-500 pl-4 max-h-[500px] overflow-y-auto">
          {history.map((event, idx) => (
            <div key={idx} className="mb-6 relative">
              <div className="absolute -left-3 top-1.5 w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="bg-gray-50 p-4 rounded shadow">
                <p>
                  <span className="font-semibold">Status:</span> {event.status}
                </p>
                <p>
                  <span className="font-semibold">Time:</span>{" "}
                  {new Date(event.event_timestamp).toLocaleString()}
                </p>
                {event.note && (
                  <p>
                    <span className="font-semibold">Note:</span> {event.note}
                  </p>
                )}
                {event.lat && event.lon && (
                  <p>
                    <span className="font-semibold">Location:</span> {event.lat}
                    , {event.lon}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
