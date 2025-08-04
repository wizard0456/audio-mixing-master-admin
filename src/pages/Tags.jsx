import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaTrashAlt, FaPlus } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { IoSearch, IoFilter, IoPricetag } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import Loading from '../components/Loading';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchTags(currentPage, filter, searchQuery);
    }, [currentPage, filter, searchQuery]);

    const fetchTags = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/tags?page=${page}&per_page=${Per_Page}`;
        if (filter !== 'all') {
            url += `&is_active=${filter}`;
        }
        if (searchQuery) {
            url += `&search=${searchQuery}`;
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
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
                console.error("Error fetching tags", error);
                toast.error('Error fetching tags', {
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
                setLoading(false);
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

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const openModal = (tag = null) => {
        if (tag) {
            setTagName(tag.tag_name);
            setTagId(tag.id);
            setIsActive(tag.is_active == "1");
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
        const id = toast.loading(tagId ? 'Updating tag...' : 'Adding tag...', {
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
                toast.dismiss(id);
                toast.success("Tag updated successfully", {
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
                toast.dismiss(id);
                toast.success("Tag added successfully", {
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
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error adding/updating tag:', error);
            setAdding(false);
            toast.error("Error adding/updating tag", {
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
        const id = toast.loading('Deleting tag...', {
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
        
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/tags/${tagToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Tag deleted successfully', {
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
            setIsDeleting(false);
            fetchTags(currentPage, filter); // Reload fetching
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error deleting tag:', error);
            toast.error('Error deleting tag', {
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
            setIsDeleting(false);
        }
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Tag Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage and configure all platform tags and categories</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaPlus className="w-4 h-4 mr-1" />
                        <span>Add Tag</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="dark-card search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search tags by name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="modern-input search-input"
                            />
                        </div>

                        {/* Filters */}
                        <div className="filters-container">
                            <IoFilter className="dark-text-muted w-4 h-4" />
                            <button
                                className={`filter-button ${
                                    filter === 'all' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Tags
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'active' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active Tags
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'inactive' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive Tags
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tags Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                tags.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Name
                                        </th>
                                        <th className="table-header-cell">
                                            Created At
                                        </th>
                                        <th className="table-header-cell">
                                            Status
                                        </th>
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {tags.map(tag => (
                                        <tr key={tag.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <IoPricetag className="text-white text-lg" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">{tag.tag_name}</div>
                                                        <div className="text-sm dark-text-secondary">ID: {tag.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap dark-text">
                                                {new Date(tag.created_at).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    tag.is_active == 1 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {tag.is_active == 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openModal(tag)}
                                                        className="action-button action-button-view"
                                                        title="Edit Tag"
                                                    >
                                                        <TiPencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(tag)}
                                                        className="action-button action-button-delete"
                                                        title="Delete Tag"
                                                    >
                                                        <FaTrashAlt className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IoPricetag className="text-4xl" />
                        </div>
                        <h3 className="empty-state-title dark-text">No tags found</h3>
                        <p className="empty-state-description dark-text-secondary">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && tags.length > 0 && (
                <div className="mt-6">
                    <ReactPaginate
                        previousLabel={<FaAngleDoubleLeft />}
                        nextLabel={<FaAngleDoubleRight />}
                        pageCount={totalPages}
                        onPageChange={handlePageClick}
                        containerClassName="pagination"
                        pageClassName=""
                        pageLinkClassName=""
                        previousClassName=""
                        previousLinkClassName=""
                        nextClassName=""
                        nextLinkClassName=""
                        activeClassName="active"
                        disabledClassName="disabled"
                    />
                </div>
            )}

            {/* Add/Edit Tag Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Tag"
                className="modern-modal"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold dark-text">{tagId ? 'Update Tag' : 'Add Tag'}</h2>
                    <form onSubmit={handleAddOrUpdateTag} className="space-y-4">
                        <div className="mb-4">
                            <label className="form-label" htmlFor="tag">Tag Name</label>
                            <input
                                type="text"
                                name="tag"
                                className="form-input"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <label className="form-label">Status:</label>
                            <Toggle
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                                icons={false}
                                aria-label="Tag status"
                                className="modern-toggle"
                            />
                            <span className="text-sm dark-text-secondary">
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={closeModal}
                                disabled={adding}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={adding}
                            >
                                {adding ? (tagId ? 'Updating...' : 'Adding...') : (tagId ? 'Update Tag' : 'Add Tag')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteTag}
                title="Delete Tag"
                message="Are you sure you want to delete this tag? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

export default Tags;