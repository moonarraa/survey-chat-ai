import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export default function ErrorModal({ open, onClose, title = 'Ошибка', message }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            </div>
            <div className="text-gray-700 text-base mb-2">{message}</div>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Закрыть
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 