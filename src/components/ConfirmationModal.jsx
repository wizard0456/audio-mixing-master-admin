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
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <MdDelete className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-center space-x-3">
                        <button
                            type="button"
                            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
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