import React from 'react';
import Modal from './Modal';
import {
  HiExclamation,
  HiTrash,
  HiCheckCircle,
  HiInformationCircle
} from 'react-icons/hi';

const TYPE_CONFIG = {
  danger: {
    icon: HiTrash,
    iconBg: 'bg-rose-100 text-rose-600',
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
  },
  warning: {
    icon: HiExclamation,
    iconBg: 'bg-amber-100 text-amber-600',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
  },
  info: {
    icon: HiInformationCircle,
    iconBg: 'bg-indigo-100 text-indigo-600',
    confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
  },
  success: {
    icon: HiCheckCircle,
    iconBg: 'bg-emerald-100 text-emerald-600',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
  }
};

/**
 * Modal universal de confirmación (Eliminaciones, advertencias, acciones críticas)
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.danger;
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      showCloseButton={!loading}
      closeOnClickOutside={!loading}
    >
      <div className="text-center pt-2 pb-1">
        <div
          className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs`}
        >
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${config.confirmBtn}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
