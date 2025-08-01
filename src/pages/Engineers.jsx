import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaPlus } from "react-icons/fa";
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/Loading';
import Toggle from 'react-toggle';
import ConfirmationModal from '../components/ConfirmationModal';

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
        fetchEngineers(currentPage, filter, searchQuery);
    }, [currentPage, filter, searchQuery]);

    const fetchEngineers = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/engineer/list?page=${page}&per_page=${Per_Page}`;
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
        setNewEngineer(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddEngineer = async (event) => {
        event.preventDefault();
        if (newEngineer.password !== newEngineer.confirm_password) {
            toast.error("Passwords do not match", {
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
        try {
            await axios({
                method: 'post',
                url: `${API_Endpoint}admin/engineer/store`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                data: newEngineer
            });
            toast.success("Engineer added successfully!", {
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
            setAdding(false);
            closeAddEngineerModal();
            fetchEngineers(currentPage, filter); // Refresh the engineer list
        } catch (error) {
            console.error('Error adding engineer:', error);
            setAdding(false);
            toast.error("Error adding engineer.", {
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

    const openConfirmationModal = (engineer) => {
        setEngineerToDelete(engineer);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setEngineerToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteEngineer = async () => {
        if (!engineerToDelete) return;
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/engineer/${engineerToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchEngineers(currentPage, filter); // Reload fetching
            closeConfirmationModal();
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
        } catch (error) {
            console.error('Error deleting engineer:', error);
            setIsDeleting(false);
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

    const openEngineerDetailsModal = (engineer) => {
        fetchEngineerDetails(engineer.id);
        setEngineerDetailsModalOpen(true);
    };

    const closeEngineerDetailsModal = () => {
        setSelectedEngineer(null);
        setEngineerDetailsModalOpen(false);
    };

    const handleToggleActivation = async (engineerId, currentStatus) => {
        const newStatus = currentStatus == '1' ? 0 : 1;
        const id = toast.info('Updating status...', {
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
                method: 'put',
                url: `${API_Endpoint}admin/users/${engineerId}/status?status=${newStatus}`,
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineer Management</h1>
                        <p className="text-gray-600">Manage your platform engineers and their permissions</p>
                    </div>
                    <button
                        className="btn-primary flex items-center space-x-2"
                        onClick={openAddEngineerModal}
                    >
                        <FaPlus className="w-4 h-4 mr-1" />
                        <span>Add Engineer</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search engineers by name or email..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="modern-input w-full"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-2">
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'all' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Engineers
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'active' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'inactive' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Engineer Modal */}
            <Modal
                isOpen={addEngineerModalOpen}
                onRequestClose={closeAddEngineerModal}
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Engineer</h2>
                    <form onSubmit={handleAddEngineer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                className="modern-input"
                                value={newEngineer.first_name}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                className="modern-input"
                                value={newEngineer.last_name}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="modern-input"
                                value={newEngineer.email}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                className="modern-input"
                                value={newEngineer.phone_number}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="modern-input"
                                value={newEngineer.password}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="modern-input"
                                value={newEngineer.confirm_password}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={closeAddEngineerModal}
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

            {/* Confirmation Modal */}
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
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                {engineerDetailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading />
                    </div>
                ) : (
                    selectedEngineer && (
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Engineer Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">
                                            {selectedEngineer.first_name?.charAt(0)?.toUpperCase() || 'E'}
                                        </span>
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
                                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900">{selectedEngineer.email}</p>
                                    </div>
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

            {/* Engineers Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                engineers.length !== 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Engineer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {engineers.map(engineer => (
                                        <tr key={engineer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {engineer.first_name?.charAt(0)?.toUpperCase() || 'E'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {engineer.first_name} {engineer.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">ID: {engineer.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{engineer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{engineer.phone_number || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Toggle
                                                    checked={engineer.is_active == '1' || engineer.is_active === 1}
                                                    onChange={() => handleToggleActivation(engineer.id, engineer.is_active)}
                                                    icons={false}
                                                    className="modern-toggle"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openEngineerDetailsModal(engineer)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(engineer)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Engineer"
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
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-semibold text-lg">E</span>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && engineers.length > 0 && (
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
        </div>
    );
};

export default Engineers;