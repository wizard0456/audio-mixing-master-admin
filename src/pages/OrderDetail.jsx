import { useState, useEffect } from 'react';
import { FaAngleDoubleLeft, FaDownload } from "react-icons/fa";
import axios from 'axios';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants'; // Make sure you have Asset_Endpoint in your constants
import { Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [files, setFiles] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [orderStatus, setOrderStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { id } = useParams();
    const user = useSelector(selectUser);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`${API_Endpoint}order-details/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                setOrder(response.data);
                setOrderStatus(response.data.order.Order_status);
                setFiles(JSON.parse(response.data.order.order_files));
            } catch (error) {
                console.error("Error fetching order details", error);
            }
        };

        fetchOrderDetails();
    }, [id]);

    if (!order) {
        return <div>Loading...</div>;
    }

    const orderStatusMapping = {
        0: "Pending",
        1: "In Process",
        2: "Delivered",
        3: "Canceled"
    };

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        setOrderStatus(newStatus);

        const formData = new FormData();
        formData.append('order_status', newStatus);

        try {
            await axios(`${API_Endpoint}order/update-status/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData,
            });

            setOrder(prevOrder => ({
                ...prevOrder,
                order: {
                    ...prevOrder.order,
                    Order_status: newStatus
                }
            }));

            toast.success("Order status updated successfully", {
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
            console.error("Error updating order status", error);
            toast.error("Error updating order status", {
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

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedFiles([]);
    };

    const handleFileUpload = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleFileSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
            formData.append('file[]', file);
        });
        formData.append('order_status', orderStatus);

        setIsUploading(true);

        try {
            const response = await axios(`${API_Endpoint}order/update-status/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData,
            });

            setFiles(JSON.parse(response.data.order_files));

            closeModal();
            toast.success("Files uploaded successfully", {
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
            console.error("Error uploading files", error);
            toast.error("Error uploading files", {
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
            setIsUploading(false);
        }
    };

    return (
        <>
            <section className='px-5 py-10'>
                <div className="mb-10 bg-[#F6F6F6] py-6 rounded-lg px-5">
                    <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 flex items-center justify-start">
                        <FaAngleDoubleLeft size={20} className="cursor-pointer mr-2" onClick={() => window.history.back()} /> Orders / {order?.order?.id}
                    </h1>
                </div>

                <div className='flex items-stretch justify-between gap-5'>
                    <div className='w-2/3 flex item-start justify-between gap-5'>
                        <div className='w-2/4 flex flex-col gap-5'>
                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex flex-col gap-5'>
                                <p className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>User Details:</p>

                                <div className='flex flex-col gap-2'>
                                    <p className='font-THICCCBOI-Regular font-normal text-base leading-5'><span className='font-THICCCBOI-Bold font-bold'>Name:</span> {order.user_name}</p>
                                    <p className='font-THICCCBOI-Regular font-normal text-base leading-5'><span className='font-THICCCBOI-Bold '>Email:</span> {order.user_email}</p>
                                </div>
                                
                                <hr />

                                <div className='flex flex-col gap-2'>
                                    <p className='font-THICCCBOI-Regular font-normal text-base leading-5'><span className='font-THICCCBOI-Bold font-bold'>Payer Name:</span> {order.order.payer_name}</p>
                                    <p className='font-THICCCBOI-Regular font-normal text-base leading-5'><span className='font-THICCCBOI-Bold '>Payer Email:</span> {order.order.payer_email}</p>
                                </div>
                            </div>

                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex items-center gap-5'>
                                <span className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>Order Status:</span>
                                <select value={orderStatus} onChange={handleStatusChange} className="font-THICCCBOI-Regular font-normal text-sm leading-3 bg-white border border-gray-300 p-2 rounded-md">
                                    {Object.entries(orderStatusMapping).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex gap-5'>
                                <span className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>Purchased on:</span>
                                <span className='font-THICCCBOI-Regular font-normal text-sm leading-3'>{new Date(order.order.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className='w-2/4 flex flex-col item-start gap-5'>
                            <h2 className='font-THICCCBOI-SemiBold font-semibold text-base leading-5 p-5 bg-[#F6F6F6] rounded-lg text-center'>Services Purchased</h2>
                            <ul className='flex flex-col item-start justify-between gap-5'>
                                {order.order_items.map((item) => (
                                    <li key={item.id} className='flex justify-between items-center p-5 bg-[#F6F6F6] rounded-lg'>
                                        <p className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3 w-2/3'>{item.name}</p>
                                        <p className='font-THICCCBOI-Regular font-normal text-sm leading-3 bg-[#4BC500] text-white p-2 rounded-full'>${item.total_price} / {item.service_type.replace('_', ' ')}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='w-1/3 flex flex-col gap-5'>
                        <div className='flex items-center justify-between bg-[#F6F6F6] p-5 rounded-lg'>
                            <h2 className='font-THICCCBOI-SemiBold font-semibold text-base leading-5'>File Share ({files?.length ? files.length : 0})</h2>
                            <button onClick={openModal} className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3 text-white bg-stone-900 p-4 rounded-lg'>Upload Files</button>
                        </div>

                        <ul className='flex flex-col item-start justify-between gap-5 bg-[#E9E9E9] p-5 rounded-lg'>
                            {files?.length > 0 ? (
                                files.map((file, index) => (
                                    <li key={index} className='flex justify-between items-center p-5 bg-[#F6F6F6] rounded-lg'>
                                        <p>{file.split('/').pop()}</p>
                                        <a href={`${Asset_Endpoint}${file}`} className='bg-[#4BC500] text-white p-2 rounded-full'><FaDownload /></a>
                                    </li>
                                ))
                            ) : (
                                <li className='flex justify-between items-center p-5 bg-[#F6F6F6] rounded-lg'>
                                    <p>No files uploaded yet</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Upload Files"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Upload Files</h2>
                    <form onSubmit={handleFileSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="files">Select Files</label>
                            <input
                                type="file"
                                name="files"
                                className="w-full px-3 py-2 border rounded-md"
                                multiple
                                onChange={handleFileUpload}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default OrderDetail;
