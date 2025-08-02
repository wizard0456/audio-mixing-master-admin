import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight, FaSearch, FaFilter } from "react-icons/fa";
import { IoEye, IoCart, IoCheckmarkCircle, IoTime, IoWarning, IoSearch, IoFilter } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import Loading from '../components/Loading';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    // State for handling date range
    const [dates, setDates] = useState([null, null]);
    const [orderType, setOrderType] = useState('');

    useEffect(() => {
        fetchOrders(currentPage, filter, searchQuery);
    }, [currentPage, filter, orderType, searchQuery]);

    const fetchOrders = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();
        
        setLoading(true);
        let url = `${API_Endpoint}admin/order?page=${page}&per_page=${Per_Page}&order_type=${orderType}`;
        if (filter !== 'all') {
            url += `&order_status=${filter}`;
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
            setOrders(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(response.data.current_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Fetch aborted');
            } else {
                console.error("Error fetching orders", error);
                setOrders([]);
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

    const closeConfirmationModal = () => {
        setOrderToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        const id = toast.loading('Deleting order...', {
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
                url: `${API_Endpoint}admin/order/${orderToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Order deleted successfully', {
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
            fetchOrders(currentPage, filter, searchQuery);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error deleting order', {
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
            console.error('Error deleting order:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!dates[0] || !dates[1]) {
            toast.error('Please select a date range', {
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

        const startDate = dates[0].toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const endDate = dates[1].toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const apiUrl = `${API_Endpoint}/generate-pdf?start_date=${startDate}&end_date=${endDate}`;

        // Trigger the download
        window.open(apiUrl, '_blank');
    }

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Order Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage and track all platform orders and transactions</p>
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
                                placeholder="Search orders by ID or user..."
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
                                All Orders
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === '0' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('0')}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === '1' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('1')}
                            >
                                Processing
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === '2' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('2')}
                            >
                                Delivered
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === '3' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('3')}
                            >
                                Cancelled
                            </button>
                        </div>

                        {/* Order Type Filter */}
                        <div className="flex items-center space-x-2">
                            <select 
                                name="order_status" 
                                className="modern-input min-w-[150px]"
                                value={orderType} 
                                onChange={(e) => setOrderType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="one_time">One Time</option>
                                <option value="subscripton">Subscription</option>
                                <option value="revision">Revision</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            {/* Orders Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                orders.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Order ID
                                        </th>
                                        <th className="table-header-cell">
                                            Order Date
                                        </th>
                                        {user.role !== 'admin' ? (
                                            <th className="table-header-cell">
                                                Order Type
                                            </th>
                                        ) : (
                                            <>
                                                <th className="table-header-cell">
                                                    Transaction ID
                                                </th>
                                                <th className="table-header-cell">
                                                    Amount
                                                </th>
                                                <th className="table-header-cell">
                                                    Payment Method
                                                </th>
                                                <th className="table-header-cell">
                                                    Order Type
                                                </th>
                                                <th className="table-header-cell">
                                                    User Name
                                                </th>
                                                <th className="table-header-cell">
                                                    User Email
                                                </th>
                                                <th className="table-header-cell">
                                                    Payment Status
                                                </th>
                                            </>
                                        )}
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {orders.map(order => (
                                        <tr key={order.id} className="table-row relative">
                                            <td className="table-cell whitespace-nowrap">
                                                {Number(order?.notify) === 1 && (
                                                    <span className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                        New Revision
                                                    </span>
                                                )}
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            #{order.id}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">Order #{order.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {new Date(order.created_at).toLocaleDateString("en-US", { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </div>
                                            </td>
                                            {user.role !== 'admin' ? (
                                                <td className="table-cell whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                                        {order.order_type}
                                                    </span>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <div className="text-sm dark-text">{order.transaction_id || 'N/A'}</div>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <div className="text-sm font-medium dark-text">${order.amount}</div>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <div className="text-sm dark-text">{order.payment_method || 'N/A'}</div>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                                            {order.order_type === "one_time" ? "One Time" : "Subscription"}
                                                        </span>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <div className="text-sm dark-text">
                                                            {order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 'N/A' : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <div className="text-sm dark-text">{order.user ? order.user.email || 'N/A' : 'N/A'}</div>
                                                    </td>
                                                    <td className="table-cell whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            order.payment_status === 'paid' 
                                                                ? 'bg-green-500/20 text-green-400' 
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link 
                                                        to={`/order-detail/${order.id}`}
                                                        className="action-button action-button-view"
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
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IoCart className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No orders found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && orders.length > 0 && (
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

export default Orders;
