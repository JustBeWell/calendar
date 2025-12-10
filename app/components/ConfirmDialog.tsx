/**
 * Diálogo de confirmación personalizado
 * Para acciones destructivas o importantes
 */
'use client';

import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeStyles = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚡',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = typeStyles[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        {/* Icono */}
        <div className={`w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className="text-3xl">{style.icon}</span>
        </div>

        {/* Mensaje */}
        <p className="text-neutral-700 mb-6 text-base leading-relaxed">
          {message}
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-5 py-2.5 ${style.buttonBg} text-white rounded-lg transition font-medium shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
