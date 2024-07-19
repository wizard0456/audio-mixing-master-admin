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
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const Services = () => {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [serviceName, setServiceName] = useState('');
    const [serviceId, setServiceId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    useEffect(() => {
        fetchServices(currentPage);
    }, [currentPage]);

    const fetchServices = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/services?page=${page}&per_page=3`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setServices(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching services", error);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const openModal = (service = null) => {
        if (service) {
            setServiceName(service.name);
            setServiceId(service.id);
        } else {
            setServiceName('');
            setServiceId(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setServiceName('');
        setServiceId(null);
    };

    const handleAddOrUpdateService = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (serviceId) {
                // Update service
                await axios({
                    method: 'put',
                    url: `${API_Endpoint}admin/services/${serviceId}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { name: serviceName }
                });
                setServices(prevServices =>
                    prevServices.map(service =>
                        service.id === serviceId ? { ...service, name: serviceName } : service
                    )
                );
                toast.success("Service updated successfully!", {
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
                // Add new service
                const response = await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/services`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { name: serviceName }
                });
                setServices(prevServices => [response.data, ...prevServices]);
                toast.success("Service added successfully!", {
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
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error adding/updating service:', error);
            setAdding(false);
            toast.error("Error adding/updating service.", {
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

    const openConfirmationModal = (serviceId) => {
        setServiceToDelete(serviceId);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setServiceToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete) return;
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/services/${serviceToDelete}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchServices(currentPage); // Refetch services to get the updated list
            closeConfirmationModal();
            toast.success("Service deleted successfully!", {
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
            console.error('Error deleting service:', error);
            toast.error("Error deleting service.", {
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
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Services</h1>
                <button
                    className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg"
                    onClick={() => openModal()}
                >
                    Add Service
                </button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add/Update Service Modal"
            >
                <h2 className="text-2xl mb-4 font-semibold">{serviceId ? 'Update' : 'Add'} Service</h2>
                <form onSubmit={handleAddOrUpdateService} className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="service">Service Name</label>
                        <input
                            type="text"
                            name="service"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
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
                            {adding ? (serviceId ? 'Updating...' : 'Adding...') : (serviceId ? 'Update Service' : 'Add Service')}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteService}
                message="Are you sure you want to delete this service?"
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
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Price Before</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Price After</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Discount</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id}>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{service.id}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{service.name}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>${service.price || '-'}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>${service.discounted_price || '-'}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{service.discounted_price ? `${((1 - service.discounted_price / service.price) * 100).toFixed(0)}%` : '-'}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(service.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                        <Link
                                            to={`/service-detail/${service.id}`}
                                            className="bg-[#4BC500] px-3 py-2  rounded-full text-white font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px]"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => openModal(service)}
                                        >
                                            <TiPencil color="#0F2005" />
                                        </button>
                                        <button
                                            onClick={() => openConfirmationModal(service.id)}
                                        >
                                            <FaTrashAlt color="#FF0000" />
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

export default Services;