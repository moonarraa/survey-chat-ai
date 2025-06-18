export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-8 shadow-lg relative w-full max-w-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Закрыть"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
