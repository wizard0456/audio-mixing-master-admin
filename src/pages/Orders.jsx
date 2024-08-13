import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(''); // Added state for search query
    const user = useSelector(selectUser);
    const [dates, setDates] = useState([null, null]);

    useEffect(() => {
        fetchOrders(currentPage, filter, searchQuery); // Added searchQuery as a dependency
    }, [currentPage, filter, searchQuery]);

    const fetchOrders = async (page, filter, searchQuery) => {
        setLoading(true);
        try {
            let url = `${API_Endpoint}fetch/order?page=${page}&per_page=${Per_Page}`;
            if (filter !== 'all') {
                url += `&order_status=${filter}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }
            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
        } catch (error) {
            console.error("Error fetching orders", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset to first page on search
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
    
            try {
                const response = await axios({
                    method: 'post',
                    url: `${API_Endpoint}generate-pdf`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                    data: {
                        "date_range": [startDate, endDate],
                    },
                });
    
                const pdfLink = response.data.link;
    
                if (pdfLink) {
                    // Fetch the PDF file as a Blob
                    const pdfResponse = await axios.get(pdfLink, { responseType: 'blob' });
                    const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
    
                    // Trigger download
                    const link = document.createElement('a');
                    const url = window.URL.createObjectURL(pdfBlob);
                    link.href = url;
                    link.setAttribute('download', 'report.pdf'); // You can set the filename here
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url); // Clean up the URL object
                } else {
                    throw new Error('PDF link is missing in the response');
                }
    
            } catch (error) {
                console.error('Error generating report:', error);
                toast.error('Error generating report. Please try again.', {
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
            }
        } else {
            toast.error('Please select a date range to generate the report.', {
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
        }
    }
    


    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Orders</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === '0' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('0')}
                    >
                        Pending
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === '1' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('1')}
                    >
                        Processing
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === '2' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('2')}
                    >
                        Delivered
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === '3' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('3')}
                    >
                        Cancelled
                    </button>
                </div>

                <div className='flex items-center gap-2 max-w-[300px] w-full'>
                    <input
                        type="text"
                        placeholder="Search orders by ID, name or email"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-4 py-2 rounded-md bg-white border border-gray-300 w-full"
                    />
                </div>

                <div className="flex items-stretch gap-4">
                    <DateRangePicker value={dates} onChange={setDates} className="custom-daterange-picker" />
                    <button className="bg-[#0F2005] font-THICCCBOI-Medium font-medium text-[14px] text-white px-5 py-2 rounded-lg" onClick={handleGenerateReport}>Generate Report</button>
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
                    Loading...
                </div>
            ) : (
                orders.length !== 0 ? (
                    <table className='w-full border-0'>
                        <thead>
                            <tr>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Order ID</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Transaction ID</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Amount</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Currency</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">User Name</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">User Email</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Payment Status</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Order At</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{order.id}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.transaction_id}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.amount}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.currency}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.username}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.useremail}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{order.payment_status}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                            <Link to={`/order-detail/${order.id}`}><FaEye color="#4BC500" /></Link>
                                            {/* <button onClick={() => openConfirmationModal(order)}><FaTrashAlt color="#FF0000" /></button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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