import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { toast, Slide } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_Endpoint, Per_Page } from '../utilities/constants';

const Services = () => {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices(currentPage + 1);
    }, [currentPage]);

    const fetchServices = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/services?page=${page}&per_page=${Per_Page}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setServices(response.data.data);
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
        const selectedPage = event.selected;
        setCurrentPage(selectedPage);
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
            fetchServices(currentPage + 1);
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

    console.log(services)

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Services</h1>
                <button
                    className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg"
                    onClick={() => navigate('/add-service')}
                >
                    Add Service
                </button>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteService}
                message="Are you sure you want to delete this service?"
                isDeleting={isDeleting} // Passing the isDeleting prop
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
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Name</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Price Before</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Price After Discount</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Service Type</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Created At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 pb-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id}>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{service.name}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>${service.price || '-'}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{(Number(service.discounted_price) !== 0 || service.discounted_price != null) ? `$${service.discounted_price}` : "$0"}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{service.service_type}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(service.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                        <Link
                                            to={`/service-detail/${service.id}`}
                                        >
                                            <FaEye />
                                        </Link>
                                        <button
                                            onClick={() => navigate(`/edit-service/${service.id}`)}
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
                            forcePage={currentPage}
                        />
                    </div>
                )
            )}
        </>
    );
}

export default Services;