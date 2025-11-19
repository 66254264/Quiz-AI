import { useIsMobile } from '../../hooks/useMediaQuery';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className={`relative bg-white shadow-xl w-full mx-auto p-4 sm:p-6 ${
        isMobile ? 'rounded-2xl max-w-sm' : 'rounded-lg max-w-md'
      }`}>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{message}</p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all min-h-[44px] touch-manipulation"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all min-h-[44px] touch-manipulation text-sm sm:text-base font-medium"
          >
            {loading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
