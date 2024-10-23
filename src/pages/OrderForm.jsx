import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Asset_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const OrderForm = () => {
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
    const currentAudioRef = useRef(null); // Reference to keep track of the currently playing audio

    useEffect(() => {
        fetchOrders(currentPage + 1); // fetchOrders expects a 1-based page number
    }, [currentPage]);

    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}upload/lead/gen?page=${page}&per_page=${Per_Page}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setOrders(response.data.data);
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
                url: `${API_Endpoint}upload/lead/gen/${orderToDelete.id}`,
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

    const handleAudioPlay = (event) => {
        // Pause any currently playing audio
        if (currentAudioRef.current && currentAudioRef.current !== event.target) {
            currentAudioRef.current.pause();
        }
        // Set the current audio to the one being played
        currentAudioRef.current = event.target;
    };


    async function handleDownloadAll(id) {
        try {
            const response = await axios.get(API_Endpoint + "download/zip/lead/" + id);

            window.open(response.data.url, '_blank');
        } catch (error) {
            console.log(error)
        }
    }
    
    return (
        <section className='px-4 py-8 md:px-6 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Uploads</h1>
            </div>

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
                        <h2 className="font-THICCCBOI-Bold text-xl md:text-2xl text-center mb-4 font-bold">Order Details</h2>
                        <p className='py-1'><strong>Name:</strong> {selectedOrder.name}</p>
                        <p className='py-1'><strong>Email:</strong> {selectedOrder.email}</p>
                        <p className='py-1'><strong>Artist Name:</strong> {selectedOrder.arlist_name}</p>
                        <p className='py-1'><strong>Track Title:</strong> {selectedOrder.tarck_title}</p>
                        <p className='py-1'><strong>Services:</strong> {selectedOrder.services}</p>
                        <p className='py-1'><strong>Reference:</strong> {selectedOrder.reference}</p>
                        <p className='py-1'><strong>Received At:</strong> {new Date(selectedOrder.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        {selectedOrder.file_type == 1 ? (
                            <div className="my-4">
                                <div className='flex items-center justify-between'>
                                    <p><strong>Media File:</strong></p>
                                    <button
                                        onClick={() => handleDownloadAll(selectedOrder.id)}
                                        className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
                                    >Download All</button>
                                </div>
                                {JSON.parse(selectedOrder.image).map((file, index) => (
                                    <div key={index} className="my-4 w-full">
                                        <div className="flex items-center">
                                            <audio
                                                controls
                                                className='w-full rounded bg-transparent'
                                                onPlay={handleAudioPlay}
                                            >
                                                <source src={`${Asset_Endpoint}${file}`} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>

                                            {/*
                                            <button onClick={() => handleDownloadFile(file)} className="mr-2 bg-blue-500 text-white px-2 py-1 rounded">
                                                Download
                                            </button> 
                                            */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            JSON.parse(selectedOrder.image).map((file, index) => (
                                <div key={index} className="my-4">
                                    <p><strong>Media Link:</strong></p>
                                    <a href={file} className='text-blue-500 underline hover:no-underline hover:text-blue-700' target="_blank" rel="noopener noreferrer">{file}</a>
                                </div>
                            ))
                        )}
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
                    <Loading />
                </div>
            ) : (
                orders.length !== 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className='w-full border-0'>
                                <thead>
                                    <tr>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Name</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Email</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Artist Name</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Track Title</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Services</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Submition Time</th>
                                        <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg text-nowrap line-clamp-1'>{order.name}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap line-clamp-1'>{order.email}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap line-clamp-1'>{order.arlist_name}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap line-clamp-1'>{order.tarck_title}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap line-clamp-1'>{order.services}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] text-nowrap line-clamp-1'>{new Date(order.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            </td>
                                            <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                                                <div className='flex gap-2 md:gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                    <button onClick={() => openModal(order)}><FaEye color="#4BC500" /></button>
                                                    <button onClick={() => openConfirmationModal(order)}><FaTrashAlt color="#FF0000" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
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
                            forcePage={currentPage}
                        />
                    </div>
                )
            )}
        </section>
    );
}

export default OrderForm;