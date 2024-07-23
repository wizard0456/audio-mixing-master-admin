import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';

const Labels = () => {
    const [labels, setLabels] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [labelName, setLabelName] = useState('');
    const [labelId, setLabelId] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('active');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchLabels(currentPage, filter);
    }, [currentPage, filter]);

    const fetchLabels = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/labels?page=${page}&per_page=10`;
        if (filter !== 'all') {
            url += `&is_active=${filter}`;
        }

        try {
            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
                signal: abortController.current.signal,
            });
            setLabels(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                console.error("Error fetching labels", error);
                setLoading(false);
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
            }
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const openModal = (label = null) => {
        if (label) {
            setLabelName(label.name);
            setLabelId(label.id);
            setIsActive(label.is_active === "1");
        } else {
            setLabelName('');
            setLabelId(null);
            setIsActive(true);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setLabelName('');
        setLabelId(null);
        setIsActive(true);
    };

    const handleAddOrUpdateLabel = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (labelId) {
                // Update label
                await axios({
                    method: 'put',
                    url: `${API_Endpoint}admin/labels/${labelId}?name=${labelName}&is_active=${isActive ? 1 : 0}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
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
                    data: { name: labelName, is_active: isActive ? 1 : 0 }
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
            fetchLabels(currentPage, filter); // Refetch labels to get the updated list
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
                    <div className="flex items-center gap-2">
                        <p><strong>Status:</strong></p>
                        <Toggle
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            icons={false}
                            aria-label="Label status"
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

        

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Labels
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Labels
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Labels
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center">
                    Loading...
                </div>
            ) : (
                <table className='w-full border-0'>
                    <thead>
                        <tr>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">ID</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Name</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Status</th>
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
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{label.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                        <button
                                            onClick={() => openModal(label)}
                                        >
                                            <TiPencil color="#0F2005" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

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