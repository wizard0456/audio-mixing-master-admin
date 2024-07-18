import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const Labels = () => {
    const [labels, setLabels] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [labelName, setLabelName] = useState('');
    const [labelId, setLabelId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState(null);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchLabels(currentPage);
    }, [currentPage]);

    const fetchLabels = async (page) => {
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/labels?page=${page}&per_page=2`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setLabels(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching labels", error);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const openModal = (label = null) => {
        if (label) {
            setLabelName(label.name);
            setLabelId(label.id);
        } else {
            setLabelName('');
            setLabelId(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setLabelName('');
        setLabelId(null);
    };

    const handleAddOrUpdateLabel = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (labelId) {
                // Update label
                await axios({
                    method: 'put',
                    url: `${API_Endpoint}admin/labels/${labelId}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { name: labelName }
                });
                toast.success("Label updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            } else {
                // Add new label
                await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/labels`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { name: labelName }
                });
                toast.success("Label added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            }
            setAdding(false);
            closeModal();
            fetchLabels(currentPage); // Refetch labels to get the updated list
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error adding/updating label:', error);
            setAdding(false);
            toast.error("Error adding/updating label.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        }
    };

    const openConfirmationModal = (labelId) => {
        setLabelToDelete(labelId);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setLabelToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteLabel = async () => {
        if (!labelToDelete) return;
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/labels/${labelToDelete}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchLabels(currentPage); // Refetch labels to get the updated list
            closeConfirmationModal();
            toast.success("Label deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error deleting label:', error);
            toast.error("Error deleting label.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Labels</h1>
                <button 
                    className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg"
                    onClick={() => openModal()}
                >
                    Add Labels
                </button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add/Update Label Modal"
            >
                <h2 className="text-2xl mb-4 font-semibold">{labelId ? 'Update' : 'Add'} Label</h2>
                <form onSubmit={handleAddOrUpdateLabel} className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="label">Label Name</label>
                        <input 
                            type="text" 
                            name="label" 
                            value={labelName}
                            onChange={(e) => setLabelName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button"
                            className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                            onClick={closeModal}
                            disabled={adding}
                        >
                            Close
                        </button>
                        <button 
                            type="submit"
                            className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                            disabled={adding}
                        >
                            {adding ? (labelId ? 'Updating...' : 'Adding...') : (labelId ? 'Update Label' : 'Add Label')}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteLabel}
                message="Are you sure you want to delete this label?"
            />

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0F2005] font-THICCCBOI-SemiBold font-semibold text-[12px] text-white px-5 py-2 rounded-lg flex items-center">
                        Active Services <span className="bg-[#4BC500] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">5</span>
                    </div>
                    <div className="bg-[#E9E9E9]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Archived <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                    <div className="bg-[#E9E9E9]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Trash <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                </div>
            </div>

            <table className='w-full border-0'>
                <thead>
                    <tr>
                        <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">ID</th>
                        <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Name</th>
                        <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
                        <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Updated At</th>
                        <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {labels.map(label => (
                        <tr key={label.id}>
                            <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                <div className='px-3 py-5 bg-[#F6F6F6]'>{label.id}</div>
                            </td>
                            <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                <div className='px-3 py-5 bg-[#F6F6F6]'>{label.name}</div>
                            </td>
                            <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(label.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(label.updated_at).toLocaleDateString()}</div>
                            </td>
                            <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                    <button 
                                        onClick={() => openModal(label)}
                                    >
                                        <TiPencil color="#0F2005" />
                                    </button>
                                    <button 
                                        onClick={() => openConfirmationModal(label.id)}
                                    >
                                        <FaTrashAlt color="#FF0000" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center mt-6">
                <ReactPaginate
                    previousLabel={"« Previous"}
                    nextLabel={"Next »"}
                    breakLabel={"..."}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                />
            </div>
        </>
    );
}

export default Labels;