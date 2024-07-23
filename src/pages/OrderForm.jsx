import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal'; // Ensure this path is correct

const OrderForm = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null); // State to manage the order to be deleted
    const user = useSelector(selectUser);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}upload/lead/generation?page=${page}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
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
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}upload/lead/generation/${orderToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchOrders(currentPage); // Reload fetching
            closeConfirmationModal();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Order Form</h1>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteOrder}
                message="Are you sure you want to delete this order?"
            />

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Order Details"
            >
                {selectedOrder && (
                    <div>
                        <h2 className="text-2xl mb-4 font-semibold">Order Details</h2>
                        <p><strong>ID:</strong> {selectedOrder.id}</p>
                        <p><strong>Name:</strong> {selectedOrder.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.email}</p>
                        <p><strong>Artist Name:</strong> {selectedOrder.arlist_name}</p>
                        <p><strong>Track Title:</strong> {selectedOrder.tarck_title}</p>
                        <p><strong>Services:</strong> {selectedOrder.services}</p>
                        <p><strong>Reference:</strong> {selectedOrder.reference}</p>
                        <p><strong>Created At:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                        <p><strong>Updated At:</strong> {new Date(selectedOrder.updated_at).toLocaleDateString()}</p>
                        {selectedOrder.image && (
                            <div className="my-4">
                                <p><strong>Media:</strong></p>

                                <audio controls>
                                    <source src={`${Asset_Endpoint}${selectedOrder.image}`} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                        <button
                            type="button"
                            className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded mt-4"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                )}
            </Modal>

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
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Email</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Artist Name</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Track Title</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Services</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Reference</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Updated At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.id}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.name}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.email}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.arlist_name}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.tarck_title}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.services}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{order.reference}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(order.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(order.updated_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                        <button onClick={() => openModal(order)}><FaEye color="#4BC500" /></button>
                                        <button onClick={() => openConfirmationModal(order)}><FaTrashAlt color="#FF0000" /></button>
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

export default OrderForm;