import { Loader2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Sim, Excluir', 
  cancelText = 'Cancelar', 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="glass-panel p-6 w-full max-w-sm text-center shadow-2xl border border-red-500/20">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-6">
          {message}
        </p>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg bg-surface border border-surface-border text-white hover:bg-white/10 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 font-medium text-sm disabled:opacity-50"
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
