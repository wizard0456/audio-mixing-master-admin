import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { toast, Slide } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import Loading from '../components/Loading';

const Services = () => {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState('all');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const abortController = useRef(null);

    useEffect(() => {
        fetchServices(currentPage, filter);
    }, [currentPage, filter]);

    const fetchServices = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/services?page=${page}&per_page=${Per_Page}`;
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
            setServices(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching services", error);
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
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/services/${serviceToDelete}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchServices(currentPage, filter);
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
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusToggle = async (serviceId, currentStatus) => {
        try {
            const newStatus = currentStatus === "1" ? "0" : "1";
            await axios({
                method: 'post',
                url: `${API_Endpoint}admin/services/${serviceId}/status?status=${newStatus}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            toast.success(`Service status updated to ${newStatus === "1" ? "Active" : "Inactive"}!`, {
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
            fetchServices(currentPage, filter);
        } catch (error) {
            console.error('Error updating service status:', error);
            toast.error("Error updating service status.", {
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
        <section className='px-4 py-8 md:px-5 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Services</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Services
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Services
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Services
                    </button>
                </div>
                <button
                    onClick={() => navigate('/add-service')}
                    className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                >
                    Add Service
                </button>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteService}
                message="Are you sure you want to delete this service?"
                isDeleting={isDeleting}
            />

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                services.length !== 0 ? (
                    <div className="overflow-x-auto">
                        <table className='w-full border-0'>
                            <thead>
                                <tr>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Name</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Price Before</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Price After Discount</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Service Type</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Created At</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Active</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5 text-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <tr key={service.id}>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg text-nowrap'>{service.name}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>${service.price || '-'}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>{(Number(service.discounted_price) != 0 || service.discounted_price != null) ? `$${service.discounted_price}` : "-"}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>{service.service_type}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] text-nowrap'>{new Date(service.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-4 bg-[#F6F6F6] text-nowrap'>
                                                <Toggle
                                                    checked={service.is_active === "1"}
                                                    onChange={() => handleStatusToggle(service.id, service.is_active)}
                                                    icons={false}
                                                />
                                            </div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <Link to={`/service-detail/${service.id}`}><FaEye /></Link>
                                                <button onClick={() => openConfirmationModal(service.id)}><FaTrashAlt color="#FF0000" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No services found
                    </div>
                )
            )}

            {loading || (
                services.length !== 0 && (
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

export default Services;