// src/components/Button.jsx
export default function Button({ children, onClick, type = 'button', fullWidth = false, variant = 'primary' }) {
  // Define styles based on variant
  let baseClasses = `font-semibold py-2 px-4 rounded-lg transition-colors ${fullWidth ? 'w-full' : ''}`;

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-300 hover:bg-gray-400 text-gray-800';
      break;
    case 'danger':
      variantClasses = 'bg-red-600 hover:bg-red-700 text-white';
      break;
    default:
      variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </button>
  );
}
