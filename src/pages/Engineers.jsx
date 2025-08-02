import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaSearch, FaFilter, FaUserPlus } from "react-icons/fa";
import { IoEye, IoTrash, IoSearch, IoFilter, IoPersonAdd, IoPerson, IoPeople, IoConstruct } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Toggle from 'react-toggle';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const Engineers = () => {
    const [engineers, setEngineers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [engineerToDelete, setEngineerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [engineerDetailsModalOpen, setEngineerDetailsModalOpen] = useState(false);
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [engineerDetailsLoading, setEngineerDetailsLoading] = useState(false);
    
    // State variables for add engineer modal
    const [addEngineerModalOpen, setAddEngineerModalOpen] = useState(false);
    const [newEngineer, setNewEngineer] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: ''
    });
    const [adding, setAdding] = useState(false);

    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchEngineers(currentPage, filter);
    }, [currentPage, filter]);

    const fetchEngineers = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/engineer/list?page=${page}&per_page=${Per_Page}`;
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
            setEngineers(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching engineers", error);
                setLoading(false);
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
            }
        }
    };

    const fetchEngineerDetails = async (engineerId) => {
        setEngineerDetailsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: `${API_Endpoint}admin/engineer/${engineerId}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setSelectedEngineer(response.data);
            setEngineerDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching engineer details:', error);
            setEngineerDetailsLoading(false);
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
    };

    const getFilteredEngineers = () => {
        if (!searchQuery) return engineers;
        
        return engineers.filter(engineer => 
            engineer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            engineer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            engineer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            engineer.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const openConfirmationModal = (engineer) => {
        setEngineerToDelete(engineer);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setConfirmationModalOpen(false);
        setEngineerToDelete(null);
    };

    const handleDeleteEngineer = async () => {
        if (!engineerToDelete) return;

        setIsDeleting(true);
        const id = toast.loading('Deleting engineer...', {
            position: "top-right",
            autoClose: false,
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
                url: `${API_Endpoint}admin/engineer/${engineerToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Engineer deleted successfully', {
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
            fetchEngineers(currentPage, filter);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error deleting engineer', {
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
            console.error('Error deleting engineer:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openEngineerDetailsModal = (engineer) => {
        setSelectedEngineer(engineer);
        fetchEngineerDetails(engineer.id);
        setEngineerDetailsModalOpen(true);
    };

    const closeEngineerDetailsModal = () => {
        setEngineerDetailsModalOpen(false);
        setSelectedEngineer(null);
    };

    const handleToggleActivation = async (engineerId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const id = toast.loading('Updating engineer status...', {
            position: "top-right",
            autoClose: false,
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
                method: 'put',
                url: `${API_Endpoint}admin/engineer/${engineerId}/status?status=${newStatus}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Engineer status updated successfully', {
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
            fetchEngineers(currentPage, filter); // Refresh engineer list
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error updating engineer status', {
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
            console.error('Error updating engineer status:', error);
        }
    };

    const openAddEngineerModal = () => {
        setAddEngineerModalOpen(true);
    };

    const closeAddEngineerModal = () => {
        setAddEngineerModalOpen(false);
        setNewEngineer({
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            password: '',
            confirm_password: ''
        });
    };

    const handleAddEngineerInputChange = (e) => {
        const { name, value } = e.target;
        setNewEngineer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddEngineer = async (event) => {
        event.preventDefault();
        
        if (newEngineer.password !== newEngineer.confirm_password) {
            toast.error('Passwords do not match', {
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
            return;
        }

        setAdding(true);
        const id = toast.loading('Adding engineer...', {
            position: "top-right",
            autoClose: false,
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
                method: 'post',
                url: `${API_Endpoint}admin/engineer/store`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    first_name: newEngineer.first_name,
                    last_name: newEngineer.last_name,
                    email: newEngineer.email,
                    phone_number: newEngineer.phone_number,
                    password: newEngineer.password
                }
            });
            toast.dismiss(id);
            toast.success('Engineer added successfully', {
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
            fetchEngineers(currentPage, filter);
            closeAddEngineerModal();
        } catch (error) {
            toast.dismiss(id);
            const errorMessage = error.response?.data?.message || 'Error adding engineer';
            toast.error(errorMessage, {
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
            console.error('Error adding engineer:', error);
        } finally {
            setAdding(false);
        }
    };

    const filteredEngineers = getFilteredEngineers();

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Engineer Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage your audio engineering team and their permissions</p>
                    </div>
                    <button
                        onClick={openAddEngineerModal}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoPersonAdd className="w-4 h-4" />
                        <span>Add Engineer</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search engineers by name, email or phone..."
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
                                All Engineers
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

            {/* Engineers Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                filteredEngineers.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Engineer
                                        </th>
                                        <th className="table-header-cell">
                                            Email
                                        </th>
                                        <th className="table-header-cell">
                                            Phone
                                        </th>
                                        <th className="table-header-cell">
                                            Status
                                        </th>
                                        <th className="table-header-cell">
                                            Joined
                                        </th>
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {filteredEngineers.map(engineer => (
                                        <tr key={engineer.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                                        <IoConstruct className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium dark-text">
                                                            {engineer.first_name} {engineer.last_name}
                                                        </div>
                                                        <div className="text-sm dark-text-muted">ID: {engineer.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">{engineer.email}</div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">{engineer.phone_number || 'N/A'}</div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <Toggle
                                                    checked={engineer.is_active == '1' || engineer.is_active === 1}
                                                    onChange={() => handleToggleActivation(engineer.id, engineer.is_active)}
                                                    icons={false}
                                                    className="modern-toggle"
                                                />
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {new Date(engineer.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openEngineerDetailsModal(engineer)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(engineer)}
                                                        className="action-button action-button-delete"
                                                        title="Delete Engineer"
                                                    >
                                                        <IoTrash className="w-4 h-4" />
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
                            <IoConstruct className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No engineers found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && filteredEngineers.length > 0 && !searchQuery && (
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

            {/* Filtering message */}
            {searchQuery && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredEngineers.length} of {engineers.length} engineers matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteEngineer}
                title="Delete Engineer"
                message="Are you sure you want to delete this engineer? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            {/* Engineer Details Modal */}
            <Modal
                isOpen={engineerDetailsModalOpen}
                onRequestClose={closeEngineerDetailsModal}
                contentLabel="Engineer Details"
                className="modern-modal"
            >
                {engineerDetailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading />
                    </div>
                ) : (
                    selectedEngineer && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Engineer Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                        <IoConstruct className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {selectedEngineer.first_name} {selectedEngineer.last_name}
                                        </h3>
                                        <p className="text-gray-500">{selectedEngineer.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                                        <p className="text-gray-900">{selectedEngineer.phone_number || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                        <p className={`font-medium ${selectedEngineer.is_active === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedEngineer.is_active === 1 ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Joined Date</p>
                                        <p className="text-gray-900">
                                            {new Date(selectedEngineer.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Engineer ID</p>
                                        <p className="text-gray-900">{selectedEngineer.id}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeEngineerDetailsModal}
                                    className="btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                )}
            </Modal>

            {/* Add Engineer Modal */}
            <Modal
                isOpen={addEngineerModalOpen}
                onRequestClose={closeAddEngineerModal}
                contentLabel="Add Engineer"
                className="modern-modal"
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Engineer</h2>
                    <form onSubmit={handleAddEngineer} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={newEngineer.first_name}
                                    onChange={handleAddEngineerInputChange}
                                    className="modern-input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={newEngineer.last_name}
                                    onChange={handleAddEngineerInputChange}
                                    className="modern-input w-full"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newEngineer.email}
                                onChange={handleAddEngineerInputChange}
                                className="modern-input w-full"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={newEngineer.phone_number}
                                onChange={handleAddEngineerInputChange}
                                className="modern-input w-full"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newEngineer.password}
                                    onChange={handleAddEngineerInputChange}
                                    className="modern-input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={newEngineer.confirm_password}
                                    onChange={handleAddEngineerInputChange}
                                    className="modern-input w-full"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={closeAddEngineerModal}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={adding}
                            >
                                {adding ? 'Adding...' : 'Add Engineer'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Engineers;