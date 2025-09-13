export default function Card({ title, children, error }) {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      {title && <h2 className="text-3xl font-bold text-blue-600 text-center mb-2">{title}</h2>}
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      {children}
    </div>
  );
}
