import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt } from "react-icons/fa";
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

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
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
        <section className='px-4 py-8 md:px-5 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Engineers</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Engineers
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Engineers
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Engineers
                    </button>
                </div>
                <button
                    className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                    onClick={openAddEngineerModal}
                >
                    Add Engineer
                </button>
            </div>

            {/* Add Engineer Modal */}
            <Modal
                isOpen={addEngineerModalOpen}
                onRequestClose={closeAddEngineerModal}
                contentLabel="Add Engineer"
            >
                <div>
                    <h2 className="text-xl md:text-2xl mb-4 font-semibold">Add Engineer</h2>
                    <form onSubmit={handleAddEngineer} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.first_name}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.last_name}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.email}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone_number">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.phone_number}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.password}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm_password">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newEngineer.confirm_password}
                                onChange={handleAddEngineerInputChange}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeAddEngineerModal}
                                disabled={adding}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
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
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteEngineer}
                message="Are you sure you want to delete this engineer?"
                isDeleting={isDeleting} // Pass the isDeleting state to modal
            />

            {/* Engineer Details Modal */}
            <Modal
                isOpen={engineerDetailsModalOpen}
                onRequestClose={closeEngineerDetailsModal}
                contentLabel="Engineer Details"
            >
                {engineerDetailsLoading ? (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        <Loading />
                    </div>
                ) : (
                    selectedEngineer && (
                        <div>
                            <h2 className="text-2xl mb-4 font-semibold">Engineer Details</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p>{`${selectedEngineer.first_name} ${selectedEngineer.last_name}`}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <p>{selectedEngineer.email}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                                <p>{new Date(selectedEngineer.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                                <p>{selectedEngineer.is_active == 1 ? 'Active' : 'Inactive'}</p>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                    onClick={closeEngineerDetailsModal}
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
                engineers.length !== 0 ? (
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
                                {engineers.map(engineer => (
                                    <tr key={engineer.id}>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg text-nowrap'>{`${engineer.first_name} ${engineer.last_name}`}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>{engineer.email}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-4 bg-[#F6F6F6]'>
                                                <Toggle
                                                    checked={engineer.is_active === '1'}
                                                    onChange={() => handleToggleActivation(engineer.id, engineer.is_active)}
                                                    icons={false}
                                                    aria-label="Engineer status"
                                                />
                                            </div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <button onClick={() => openEngineerDetailsModal(engineer)} >
                                                    <FaEye />
                                                </button>
                                                <button onClick={() => openConfirmationModal(engineer)}><FaTrashAlt color="#FF0000" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No engineers found
                    </div>
                )
            )}

            {loading || (
                engineers.length !== 0 && (
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
};

export default Engineers;