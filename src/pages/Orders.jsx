import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
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
    const abortController = useRef(null); // Reference for AbortController

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
                signal: abortController.current.signal, // Pass the abort signal to axios
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
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}fetch/order/${orderToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchOrders(currentPage, filter, searchQuery);
            closeConfirmationModal();
            toast.success('Order deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Error deleting order.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGenerateReport = async () => {
        if (dates[0] && dates[1]) {
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
    }

    return (
        <section className='px-4 py-8 md:px-6 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Orders</h1>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-between mb-6 gap-4">
                <div className='flex items-center gap-2 w-full lg:w-auto'>
                    <input
                        type="text"
                        placeholder="Search orders"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-4 py-2 rounded-md bg-white border border-gray-300 w-full lg:w-auto"
                    />
                </div>
                {
                    user.role === 'admin' &&
                    (
                        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 w-full md:w-auto">
                            <DateRangePicker value={dates} onChange={setDates} className="custom-daterange-picker w-full md:w-auto" />
                            <button className="bg-[#0F2005] font-THICCCBOI-Medium font-medium text-sm md:text-[14px] text-white px-4 md:px-5 py-2 rounded-lg w-full md:w-auto" onClick={handleGenerateReport}>Generate Report</button>
                        </form>
                    )
                }
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg ${filter == '0' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('0')}
                    >
                        Pending
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg ${filter == '1' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('1')}
                    >
                        Processing
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg ${filter == '2' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('2')}
                    >
                        Delivered
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg ${filter == '3' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('3')}
                    >
                        Cancelled
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full lg:w-auto">
                    <div className='flex items-center gap-2 w-full lg:w-auto'>
                        <select name="order_status" className='bg-[#E9E9E9] font-THICCCBOI-Medium font-medium text-sm md:text-[14px] px-4 md:px-5 py-2 rounded-lg' value={orderType} onChange={(e) => setOrderType(e.target.value)} id="">
                            <option value="">All</option>
                            <option value="one_time">One Time</option>
                            <option value="subscripton">Subscription</option>
                            <option value="revision">Revision</option>

                        </select>
                    </div>

                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                message="Are you sure you want to delete this order?"
                isDeleting={isDeleting}
            />

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                orders.length !== 0 ? (
                    <div className="overflow-x-auto">
                        <table className='w-full border-0'>
                            <thead>
                                <tr>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Order ID</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Order At</th>
                                    {user.role !== 'admin' ?
                                        (<th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Order Type</th>)
                                        : (
                                            <>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Transaction ID</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Amount</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Payment Method</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Order Type</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">User Name</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">User Email</th>
                                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Payment Status</th>
                                            </>
                                        )}
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-2 md:px-3 text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className='relative'>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                            {Number(order?.notify) === 1 ? <span className='absolute -top-2 -left-0 bg-[#4CC800] text-white font-THICCCBOI-Medium text-sm px-3 py-1 rounded-full'>New Revision</span> : null}

                                            <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg text-nowrap'>{order.id}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                            <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>{new Date(order.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        </td>
                                        {user.role !== 'admin' ?
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>{order.order_type}</div>
                                            </td>
                                            : (
                                                <>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>{order.transaction_id}</div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>${order.amount}</div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>{order.payment_method ? order.payment_method : 'N/A'}</div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>{order.order_type == "one_time" ? "One Time" : "Subscription"}</div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'>
                                                            {order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 'N/A' : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6]  text-nowrap'>{order.user ? order.user.email || 'N/A' : 'N/A'}</div>
                                                    </td>
                                                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                                        <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap'><span className='text-sm px-2 py-1 rounded-full bg-[#4BC500] text-white'>{order.payment_status}</span></div>
                                                    </td>
                                                </>
                                            )
                                        }
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-5 md:leading-6 pb-4 md:pb-5">
                                            <div className='flex gap-2 md:gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <Link to={`/order-detail/${order.id}`}><FaEye color="#4BC500" /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No orders found
                    </div>
                )
            )}

            {!loading && (
                orders.length !== 0 && (
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

export default Orders;
