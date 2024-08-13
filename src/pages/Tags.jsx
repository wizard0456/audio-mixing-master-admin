import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaTrashAlt } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const Tags = () => {
    const [tags, setTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagId, setTagId] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchTags(currentPage, filter);
    }, [currentPage, filter]);

    const fetchTags = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/tags?page=${page}&per_page=${Per_Page}`;
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
            setTags(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching tags", error);
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

    const openModal = (tag = null) => {
        if (tag) {
            setTagName(tag.tag_name);
            setTagId(tag.id);
            setIsActive(tag.is_active === "1");
        } else {
            setTagName('');
            setTagId(null);
            setIsActive(true);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setTagName('');
        setTagId(null);
        setIsActive(true);
    };

    const handleAddOrUpdateTag = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (tagId) {
                // Update tag
                await axios({
                    method: 'put',
                    url: `${API_Endpoint}admin/tags/${tagId}?tag_name=${tagName}&is_active=${isActive ? 1 : 0}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success("Tag updated successfully!", {
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
                // Add new tag
                await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/tags`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { tag_name: tagName, is_active: isActive ? 1 : 0 }
                });
                toast.success("Tag added successfully!", {
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
            fetchTags(currentPage, filter); // Refetch tags to get the updated list
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error adding/updating tag:', error);
            setAdding(false);
            toast.error("Error adding/updating tag.", {
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

    const openConfirmationModal = (tag) => {
        setTagToDelete(tag);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setTagToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteTag = async () => {
        if (!tagToDelete) return;
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/tags/${tagToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchTags(currentPage, filter); // Reload fetching
            closeConfirmationModal();
        } catch (error) {
            console.error('Error deleting tag:', error);
            setIsDeleting(false);
        }
    };

    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Tags</h1>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Tags
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Tags
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Tags
                    </button>
                </div>
                <button
                    onClick={() => openModal()}
                    className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                >
                    Add Tag
                </button>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteTag}
                message="Are you sure you want to delete this tag?"
                isDeleting={isDeleting} // Pass the isDeleting state to modal
            />

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    Loading...
                </div>
            ) : (
                tags.length !== 0 ? (
                    <table className='w-full border-0'>
                        <thead>
                            <tr>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Name</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Created At</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Status</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map(tag => (
                                <tr key={tag.id}>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{tag.tag_name}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(tag.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{tag.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                            <button onClick={() => openModal(tag)}><TiPencil color="#969696" /></button>
                                            <button onClick={() => openConfirmationModal(tag)}><FaTrashAlt color="#FF0000" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No tags found
                    </div>
                )
            )}

            {loading || (
                tags.length !== 0 && (
                    <div className="flex justify-center mt-6">
                        <ReactPaginate
                            previousLabel={<FaAngleDoubleLeft />}
                            nextLabel={<FaAngleDoubleRight />}
                            breakLabel={"..."}
                            pageCount={totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                            forcePage={currentPage - 1}
                        />
                    </div>
                )
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Tag"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">{tagId ? 'Update Tag' : 'Add Tag'}</h2>
                    <form onSubmit={handleAddOrUpdateTag} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tag">Tag Name</label>
                            <input
                                type="text"
                                name="tag"
                                className="w-full px-3 py-2 border rounded-md"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <p><strong>Status:</strong></p>
                            <Toggle
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                                icons={false}
                                aria-label="Tag status"
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
                                className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                                disabled={adding}
                            >
                                {adding ? (tagId ? 'Updating...' : 'Adding...') : (tagId ? 'Update Tag' : 'Add Tag')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}

export default Tags;