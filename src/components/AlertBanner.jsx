// src/components/AlertBanner.jsx

export default function AlertBanner({ message }) {
  return (
    <div className="bg-red-200 text-red-900 p-4 rounded mb-4 font-semibold">
      {message}
    </div>
  );
}
