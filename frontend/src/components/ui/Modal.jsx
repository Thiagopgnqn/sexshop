import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative bg-surface rounded-lg w-full ${maxWidth} max-h-[90vh] flex flex-col p-6 shadow-overlay border border-border z-10 my-auto text-content`}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-border-subtle flex-shrink-0">
          {title && (
            <h3 className="text-lg font-display font-normal tracking-wider text-content">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="text-content-secondary hover:text-content p-1.5 rounded-md hover:bg-surface-elevated transition-smooth"
            aria-label="Cerrar modal"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
