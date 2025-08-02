import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEdit, FaEye, FaTrashAlt, FaPlus } from "react-icons/fa";
import { IoMusicalNotes, IoEye, IoCreate, IoAdd, IoTrash, IoMusicalNote } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { toast, Slide } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Toggle from 'react-toggle';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import Loading from '../components/Loading';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';

const Services = () => {
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const abortController = useRef(null);

    useEffect(() => {
        fetchServices(currentPage, filter, searchQuery);
    }, [currentPage, filter, searchQuery]);

    const fetchServices = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/services?page=${page}&per_page=${Per_Page}`;
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
            setServices(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.total_pages);
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

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
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
            const newStatus = currentStatus == "1" ? "0" : "1";
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

    const filters = [
        { value: 'all', label: 'All Services' },
        { value: 'active', label: 'Active Services' },
        { value: 'inactive', label: 'Inactive Services' }
    ];

    const actionButton = (
        <button
            onClick={() => navigate('/add-service')}
            className="btn-primary flex items-center space-x-2"
        >
            <IoAdd className="w-4 h-4" />
            <span>Add Service</span>
        </button>
    );

    return (
        <PageLayout
            title="Service Management"
            subtitle="Manage and configure all platform services and pricing"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search services by name..."
            filters={filters}
            onFilterChange={handleFilterChange}
            currentFilter={filter}
            actionButton={actionButton}
        >

            {/* Services Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                services.length !== 0 ? (
                    <div className="dark-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="modern-table-header">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Price Before
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Price After Discount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Service Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Active
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {services.map(service => (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {service.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">${service.price || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(Number(service.discounted_price) != 0 || service.discounted_price != null) ? `$${service.discounted_price}` : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{service.service_type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(service.createdAt).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Toggle
                                                        checked={service.is_active == "1"}
                                                        onChange={() => handleStatusToggle(service.id, service.is_active)}
                                                        icons={false}
                                                        aria-label="Service status"
                                                        className="react-toggle"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <Link 
                                                        to={`/edit-service/${service.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit Service"
                                                    >
                                                        <IoCreate className="w-4 h-4" />
                                                    </Link>
                                                    <Link 
                                                        to={`/service-detail/${service.id}`}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </Link>
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
                            <IoMusicalNote className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && services.length > 0 && (
                <div className="mt-6">
                    <div className="text-center">
                        <p className="font-medium text-sm text-gray-600 mb-2">
                            Page {currentPage} of {totalPages} • Showing {services.length} services
                        </p>
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
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteService}
                title="Delete Service"
                message="Are you sure you want to delete this service? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </PageLayout>
    );
};

export default Services;