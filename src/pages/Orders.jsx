import  { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal'; // Ensure this path is correct
import { Slide, toast } from 'react-toastify';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); // Set initial page to 0
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null); // State to manage the order to be deleted
    const [isDeleting, setIsDeleting] = useState(false); // State to manage deletion loading
    const user = useSelector(selectUser);

    useEffect(() => {
        fetchOrders(currentPage + 1); // fetchOrders expects a 1-based page number
    }, [currentPage]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}fetch/order?page=${page}&per_page=${Per_Page}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data);
            // setCurrentPage(response.data.current_page - 1); // API returns 1-based page number
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        setCurrentPage(selectedPage);
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedOrder(null);
    };

    const openConfirmationModal = (order) => {
        setOrderToDelete(order);
        setConfirmationModalOpen(true);
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
        <>
            <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 mb-6">Orders</h1>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                message="Are you sure you want to delete this order?"
                isDeleting={isDeleting} // Pass the isDeleting state to modal
            />

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Order Details"
            >
                {selectedOrder && (
                    <div>
                        <h2 className="font-THICCCBOI-Bold text-2xl text-center mb-4 font-bold">Order Details</h2>
                        <p className='py-1'><strong>Order ID:</strong> {selectedOrder.id}</p>
                        <p className='py-1'><strong>Transaction ID:</strong> {selectedOrder.transaction_id}</p>
                        <p className='py-1'><strong>Amount:</strong> ${selectedOrder.amount}</p>
                        <p className='py-1'><strong>Currency:</strong> {selectedOrder.currency}</p>
                        <p className='py-1'><strong>Payer Name:</strong> {selectedOrder.payer_name}</p>
                        <p className='py-1'><strong>Payer Email:</strong> {selectedOrder.payer_email}</p>
                        <p className='py-1'><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                        <p className='py-1'><strong>Created At:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                        <div className="mb-4">
                            <strong>Order Items:</strong>
                            <ul>
                                {selectedOrder.order_items.map((item) => (
                                    <li key={item.id} className="ml-4">
                                        {item.name} - ${item.total_price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            type="button"
                            className="bg-red-500 font-THICCCBOI-Bold font-bold text-base mx-auto block text-white px-4 py-2 rounded mt-4"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                )}
            </Modal>

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
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Payer Name</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Payer Email</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Payment Status</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Created At</th>
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
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{order.payer_name}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{order.payer_email}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{order.payment_status}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(order.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <button onClick={() => openModal(order)}><FaEye color="#4BC500" /></button>
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
        </>
    );
}

export default Orders;