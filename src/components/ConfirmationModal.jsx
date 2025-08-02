import Modal from 'react-modal';
import { MdDelete } from "react-icons/md";
import propTypes from 'prop-types';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action", 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    isLoading = false, 
    confirmButtonClass = "bg-red-600 hover:bg-red-700" 
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modern-modal"
            overlayClassName="modal-overlay"
        >
            <div className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <MdDelete className="text-red-400" size={32} />
                </div>
                <h2 className="text-xl font-bold dark-text mb-2">{title}</h2>
                <p className="dark-text-muted mb-6">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        type="button"
                        className="px-6 py-2 dark-text-muted bg-slate-700/50 hover:bg-slate-600/50 rounded-xl font-medium transition-all duration-200 border border-slate-600/50"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`px-6 py-2 text-white rounded-xl font-medium transition-all duration-200 ${confirmButtonClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
    onConfirm: propTypes.func.isRequired,
    title: propTypes.string,
    message: propTypes.string.isRequired,
    confirmText: propTypes.string,
    cancelText: propTypes.string,
    isLoading: propTypes.bool,
    confirmButtonClass: propTypes.string,
};

export default ConfirmationModal;