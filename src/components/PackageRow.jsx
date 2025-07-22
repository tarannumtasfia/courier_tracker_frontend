// src/components/PackageRow.jsx

export default function PackageRow({ pkg, onClick }) {
  return (
    <tr
      onClick={() => onClick(pkg.id)}
      className={`cursor-pointer ${
        pkg.isStuck ? "bg-red-100 border-l-4 border-red-500" : ""
      }`}
    >
      <td>{pkg.trackingNumber}</td>
      <td>{pkg.status}</td>
      <td>{pkg.destination}</td>
      {/* other columns */}
    </tr>
  );
}
