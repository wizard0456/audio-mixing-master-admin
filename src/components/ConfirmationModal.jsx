import Modal from 'react-modal';
import { MdDelete } from "react-icons/md";
import propTypes from 'prop-types';

Modal.setAppElement('#root'); // Bind modal to your appElement

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Confirmation Modal"
        >
            <div className="text-center">
                <MdDelete className="mx-auto mb-4 text-red-600" size={130} />
                <h2 className="text-xl mb-4 font-semibold">{message}</h2>
                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        className="bg-gray-500 font-semibold text-base text-white px-4 py-2 rounded"
                        onClick={onRequestClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-[#FF0000] font-semibold text-base text-white px-4 py-2 rounded"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: propTypes.bool.isRequired,
    onRequestClose: propTypes.func.isRequired,
    onConfirm: propTypes.func.isRequired,
    message: propTypes.string.isRequired,
};

export default ConfirmationModal;