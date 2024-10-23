import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt } from "react-icons/fa";
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
        const newStatus = currentStatus === '1' ? 0 : 1;
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
        <section className='px-4 py-8 md:px-5 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Users</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Users
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Users
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Users
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteUser}
                message="Are you sure you want to delete this user?"
                isDeleting={isDeleting} // Pass the isDeleting state to modal
            />

            <Modal
                isOpen={userDetailsModalOpen}
                onRequestClose={closeUserDetailsModal}
                contentLabel="User Details"
            >
                {userDetailsLoading ? (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        <Loading />
                    </div>
                ) : (
                    selectedUser && (
                        <div>
                            <h2 className="text-2xl mb-4 font-semibold">User Details</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p>{`${selectedUser.first_name} ${selectedUser.last_name}`}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <p>{selectedUser.email}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                                <p>{new Date(selectedUser.created_at).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                                <p>{selectedUser.status === 1 ? 'Active' : 'Inactive'}</p>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                    onClick={closeUserDetailsModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                )}
            </Modal>

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                users.length !== 0 ? (
                    <div className="overflow-x-auto">
                        <table className='w-full border-0'>
                            <thead>
                                <tr>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Full Name</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Email Address</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Status</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg text-nowrap'>{`${user.first_name} ${user.last_name}`}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>{user.email}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-4 bg-[#F6F6F6]'>
                                                <Toggle
                                                    checked={user.is_active === '1'}
                                                    onChange={() => handleToggleActivation(user.id, user.is_active)}
                                                    icons={false}
                                                    aria-label="User status"
                                                />
                                            </div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <button onClick={() => openUserDetailsModal(user)} >
                                                    <FaEye />
                                                </button>
                                                <button onClick={() => openConfirmationModal(user)}><FaTrashAlt color="#FF0000" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No users found
                    </div>
                )
            )}

            {loading || (
                users.length !== 0 && (
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
        </section>
    );
}

export default Users;