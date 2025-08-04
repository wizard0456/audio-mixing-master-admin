import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight, FaDownload } from "react-icons/fa";
import { IoSearch, IoFilter, IoDocument, IoEye, IoDownload as IoDownloadIcon } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Asset_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const Uploads = () => {
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const user = useSelector(selectUser);
    const currentAudioRef = useRef(null);

    useEffect(() => {
        fetchOrders(currentPage + 1);
    }, [currentPage, filter, searchQuery]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            let url = `${API_Endpoint}upload/lead/gen?page=${page}&per_page=${Per_Page}`;
            if (filter !== 'all') {
                url += `&status=${filter}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(response.data.current_page);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error("Error fetching orders", error);
            toast.error('Error fetching uploads', {
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
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(0);
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedOrder(null);
    };

    const openConfirmationModal = (order) => {
        setOrderToDelete(order);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setOrderToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true);
        const id = toast.loading('Deleting upload...', {
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
                url: `${API_Endpoint}upload/lead/gen/${orderToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Upload deleted successfully', {
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
            fetchOrders(currentPage + 1);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error deleting order:', error);
            toast.error('Error deleting upload', {
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
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAudioPlay = (event) => {
        if (currentAudioRef.current && currentAudioRef.current !== event.target) {
            currentAudioRef.current.pause();
        }
        currentAudioRef.current = event.target;
    };

    const handleDownloadAll = async (id) => {
        try {
            const response = await axios.get(`${API_Endpoint}download/zip/lead/${id}`);
            window.open(response.data.url, '_blank');
            toast.success('Download started', {
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
            console.error('Error downloading files:', error);
            toast.error('Error downloading files', {
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

    const getFilteredOrders = () => {
        if (!searchQuery) return orders;
        
        return orders.filter(order => 
            order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.arlist_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tarck_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.services?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredOrders = getFilteredOrders();

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Upload Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage user upload submissions and track requests</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="dark-card search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search uploads by name, email, artist, or track..."
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
                                All Uploads
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'active' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'inactive' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uploads Table */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            ) : (
                filteredOrders.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Name
                                        </th>
                                        <th className="table-header-cell">
                                            Email
                                        </th>
                                        <th className="table-header-cell">
                                            Artist Name
                                        </th>
                                        <th className="table-header-cell">
                                            Track Title
                                        </th>
                                        <th className="table-header-cell">
                                            Services
                                        </th>
                                        <th className="table-header-cell">
                                            Submission Time
                                        </th>
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <IoDocument className="text-white text-lg" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">{order.name}</div>
                                                        <div className="text-sm dark-text-secondary">ID: {order.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap dark-text">
                                                {order.email}
                                            </td>
                                            <td className="table-cell whitespace-nowrap dark-text">
                                                {order.arlist_name}
                                            </td>
                                            <td className="table-cell whitespace-nowrap dark-text">
                                                {order.tarck_title}
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                    {order.services}
                                                </span>
                                            </td>
                                            <td className="table-cell whitespace-nowrap dark-text">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", { 
                                                    month: 'long', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openModal(order)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(order)}
                                                        className="action-button action-button-delete"
                                                        title="Delete Upload"
                                                    >
                                                        <FaEye className="w-4 h-4" />
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
                            <IoDocument className="text-4xl" />
                        </div>
                        <h3 className="empty-state-title dark-text">No upload submissions found</h3>
                        <p className="empty-state-description dark-text-secondary">Upload submissions will appear here when users submit their requests.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && filteredOrders.length > 0 && !searchQuery && (
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
                        forcePage={currentPage}
                    />
                </div>
            )}

            {/* Filtering message */}
            {searchQuery && (
                <div className="mt-4 text-center">
                    <p className="text-sm dark-text-secondary">
                        Showing {filteredOrders.length} of {orders.length} uploads matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* Order Details Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Order Details"
                className="modern-modal"
            >
                {selectedOrder && (
                    <div>
                        <h2 className="text-2xl font-bold dark-text mb-6">Upload Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <IoDocument className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold dark-text">{selectedOrder.name}</h3>
                                    <p className="dark-text-secondary">Upload ID: {selectedOrder.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Email</p>
                                    <p className="dark-text">{selectedOrder.email}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Artist Name</p>
                                    <p className="dark-text">{selectedOrder.arlist_name}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Track Title</p>
                                    <p className="dark-text">{selectedOrder.tarck_title}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Services</p>
                                    <p className="dark-text">{selectedOrder.services}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Received At</p>
                                    <p className="dark-text">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", { 
                                            month: 'long', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="dark-card p-4 md:col-span-2 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-1">Reference</p>
                                    <p className="dark-text text-sm break-all">{selectedOrder.reference || 'No reference provided'}</p>
                                </div>
                            </div>

                            {/* Media Files Section */}
                            {selectedOrder.file_type == 1 ? (
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium dark-text-secondary">Media Files</p>
                                        <button
                                            onClick={() => handleDownloadAll(selectedOrder.id)}
                                            className="btn-primary flex items-center space-x-2"
                                        >
                                            <IoDownloadIcon className="w-4 h-4" />
                                            <span>Download All</span>
                                        </button>
                                    </div>
                                    {JSON.parse(selectedOrder.image).map((file, index) => (
                                        <div key={index} className="mb-4">
                                            <audio
                                                controls
                                                className="w-full rounded bg-gray-700 text-white"
                                                onPlay={handleAudioPlay}
                                            >
                                                <source src={`${Asset_Endpoint}${file}`} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dark-card p-4 border border-slate-700/50">
                                    <p className="text-sm font-medium dark-text-secondary mb-2">Media Links</p>
                                    {JSON.parse(selectedOrder.image).map((file, index) => (
                                        <div key={index} className="mb-2">
                                            <a 
                                                href={file} 
                                                className="text-blue-400 underline hover:no-underline hover:text-blue-300" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                {file}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={closeModal}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                title="Delete Upload"
                message="Are you sure you want to delete this upload submission? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

export default Uploads; 