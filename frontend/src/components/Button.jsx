export default function Button({ children, onClick, type = 'button', fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${fullWidth ? 'w-full' : ''} bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
    >
      {children}
    </button>
  );
}
