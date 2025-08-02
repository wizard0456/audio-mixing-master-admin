import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaSearch, FaFilter, FaUserPlus } from "react-icons/fa";
import { IoEye, IoTrash, IoSearch, IoFilter, IoPersonAdd, IoPerson, IoPeople } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Toggle from 'react-toggle';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchUsers(currentPage, filter);
    }, [currentPage, filter]);

    const fetchUsers = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/users?page=${page}&per_page=${Per_Page}`;
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
            setUsers(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching users", error);
                setLoading(false);
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
            }
        }
    };

    const fetchUserDetails = async (userId) => {
        setUserDetailsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: `${API_Endpoint}admin/users/${userId}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setSelectedUser(response.data);
            setUserDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setUserDetailsLoading(false);
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
        // Remove the API call - we'll filter client-side
    };

    // Client-side filtering function
    const getFilteredUsers = () => {
        let filtered = users;
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                user.first_name?.toLowerCase().includes(query) ||
                user.last_name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
            );
        }
        
        // Filter by status
        if (filter === 'active') {
            filtered = filtered.filter(user => user.is_active == '1' || user.is_active === 1);
        } else if (filter === 'inactive') {
            filtered = filtered.filter(user => user.is_active == '0' || user.is_active === 0);
        }
        
        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    const openConfirmationModal = (user) => {
        setUserToDelete(user);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setUserToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/users/${userToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchUsers(currentPage, filter); // Reload fetching
            closeConfirmationModal();
            toast.success('User deleted successfully', {
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
            console.error('Error deleting user:', error);
            setIsDeleting(false);
            toast.error('Error deleting user', {
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

    const openUserDetailsModal = (user) => {
        fetchUserDetails(user.id);
        setUserDetailsModalOpen(true);
    };

    const closeUserDetailsModal = () => {
        setSelectedUser(null);
        setUserDetailsModalOpen(false);
    };

    const handleToggleActivation = async (userId, currentStatus) => {
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
                url: `${API_Endpoint}admin/users/${userId}/status?status=${newStatus}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('User status updated successfully', {
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
            fetchUsers(currentPage, filter); // Refresh user list
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error updating user status', {
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
            console.error('Error updating user status:', error);
        }
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">User Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage your platform users and their permissions</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
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
                                All Users
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

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                filteredUsers.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            User
                                        </th>
                                        <th className="table-header-cell">
                                            Email
                                        </th>
                                        <th className="table-header-cell">
                                            Role
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
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <IoPerson className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium dark-text">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                        <div className="text-sm dark-text-muted">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">{user.email}</div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium green-gradient text-white">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <Toggle
                                                    checked={user.is_active == '1' || user.is_active === 1}
                                                    onChange={() => handleToggleActivation(user.id, user.is_active)}
                                                    icons={false}
                                                    className="modern-toggle"
                                                />
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openUserDetailsModal(user)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(user)}
                                                        className="action-button action-button-delete"
                                                        title="Delete User"
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
                            <IoPeople className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No users found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && filteredUsers.length > 0 && !searchQuery && (
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
                        Showing {filteredUsers.length} of {users.length} users matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            <Modal
                isOpen={userDetailsModalOpen}
                onRequestClose={closeUserDetailsModal}
                contentLabel="User Details"
                className="modern-modal"
            >
                {userDetailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading />
                    </div>
                ) : (
                    selectedUser && (
                        <div>
                            <h2 className="text-2xl font-bold dark-text mb-6">User Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <FaUserPlus className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold dark-text">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </h3>
                                        <p className="dark-text-muted">{selectedUser.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="dark-card rounded-lg p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">Role</p>
                                        <p className="dark-text capitalize">{selectedUser.role}</p>
                                    </div>
                                    <div className="dark-card rounded-lg p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">Status</p>
                                        <p className={`font-medium ${selectedUser.is_active === 1 ? 'text-green-400' : 'text-red-400'}`}>
                                            {selectedUser.is_active === 1 ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className="dark-card rounded-lg p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">Joined Date</p>
                                        <p className="dark-text">
                                            {new Date(selectedUser.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="dark-card rounded-lg p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">User ID</p>
                                        <p className="dark-text">{selectedUser.id}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeUserDetailsModal}
                                    className="btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
};

export default Users;