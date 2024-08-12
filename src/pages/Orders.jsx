import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal'; // Ensure this path is correct
import { Slide, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]); // Initialize orders as an empty array
    const [currentPage, setCurrentPage] = useState(0); // Set initial page to 0
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null); // State to manage the order to be deleted
    const [isDeleting, setIsDeleting] = useState(false); // State to manage deletion loading
    const [orderStatus, setOrderStatus] = useState('all'); // State for order status filter
    const user = useSelector(selectUser);

    useEffect(() => {
        fetchOrders(currentPage + 1); // fetchOrders expects a 1-based page number
    }, [currentPage, orderStatus]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            let url = `${API_Endpoint}fetch/order?page=${page}&per_page=${Per_Page}`;
            if (orderStatus !== 'all') {
                url += `&order_status=${orderStatus}`;
            }
            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data || []); // Ensure orders is an array
            setTotalPages(response.data.last_page || 1); // Ensure totalPages is set
        } catch (error) {
            console.error("Error fetching orders", error);
            setOrders([]); // Set orders to an empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        setCurrentPage(selectedPage);
    };

    const handleStatusChange = (event) => {
        setOrderStatus(event.target.value);
        setCurrentPage(0); // Reset to first page on filter change
    };

    const closeConfirmationModal = () => {
        setOrderToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true); // Start loading state
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}fetch/order/${orderToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchOrders(currentPage + 1); // Reload orders after deletion
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
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
        } finally {
            setIsDeleting(false); // End loading state
        }
    };

    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Orders</h1>
            </div>

            <div className="mb-6 flex justify-end">
                <select
                    value={orderStatus}
                    onChange={handleStatusChange}
                    className="px-4 py-2 rounded-md bg-white border border-gray-300"
                >
                    <option value="all">All</option>
                    <option value="padding">padding</option>
                    <option value="inprocess">Inprocess</option>
                    <option value="complete">Complete</option>
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                </select>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                message="Are you sure you want to delete this order?"
                isDeleting={isDeleting} // Pass the isDeleting state to modal
            />

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    Loading...
                </div>
            ) : (
                orders.length !== 0 ? (
                    <>
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

                    </>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No orders found
                    </div>
                )
            )}

            {!loading && (
                orders.length != 0
                && (
                    <div className="flex justify-center mt-6">
                        <ReactPaginate
                            previousLabel={<FaAngleDoubleLeft pointerEvents={"none"} />}
                            nextLabel={<FaAngleDoubleRight pointerEvents={"none"} />}
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
            )
            }
        </section>
    );
}

export default Orders;