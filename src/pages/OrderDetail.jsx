import { useState, useEffect } from 'react';
import { FaAngleDoubleLeft } from "react-icons/fa";
import axios from 'axios';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Loading from '../components/Loading';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [files, setFiles] = useState([]);
    const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    const [revisionModalIsOpen, setRevisionModalIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [orderStatus, setOrderStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeAccordions, setActiveAccordions] = useState(["userDetails", "orderStatus"]);
    const [currentRevisionId, setCurrentRevisionId] = useState(null);
    const [revisions, setRevisions] = useState([]);
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
                setRevisions(response.data.revision)
            } catch (error) {
                console.error("Error fetching order details", error);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const orderStatusMapping = {
        0: "Pending",
        1: "In Process",
        2: "Delivered",
        3: "Canceled",
        4: "In Revision",
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
                    'Authorization': `Bearer ${user.token}`,
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

    // General File Upload Modal
    const openGeneralModal = () => {
        setGeneralModalIsOpen(true);
    };

    const closeGeneralModal = () => {
        setGeneralModalIsOpen(false);
        setSelectedFiles([]);
    };

    const handleGeneralFileUpload = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleGeneralFileSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
            formData.append('file[]', file);
        });

        formData.append('order_status', orderStatus);

        setIsUploading(true);

        try {
            const response = await axios.post(`${API_Endpoint}order/update-status/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFiles(JSON.parse(response.data.order_files));
            setOrderStatus(response.data.Order_status.toString());

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
            closeGeneralModal();
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

    // Revision File Upload Modal
    const openRevisionModal = (revisionId) => {
        setCurrentRevisionId(revisionId);
        setRevisionModalIsOpen(true);
    };

    const closeRevisionModal = () => {
        setRevisionModalIsOpen(false);
        setSelectedFiles([]);
        setCurrentRevisionId(null);
    };

    const handleRevisionFileUpload = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleRevisionFileSubmit = async (event) => {
        event.preventDefault();
        if (!currentRevisionId) return;

        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
            formData.append('files[]', file);
        });

        setIsUploading(true);

        try {
            const response = await axios.post(`${API_Endpoint}revision-update/${currentRevisionId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setRevisions(response.data.revision)
            setOrderStatus(response.data.order_status.toString())

            toast.success("Revision files uploaded successfully", {
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
            closeRevisionModal();
        } catch (error) {
            console.error("Error uploading revision files", error);
            toast.error("Error uploading revision files", {
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

    const toggleAccordion = (section) => {
        if (activeAccordions.includes(section)) {
            setActiveAccordions(activeAccordions.filter((item) => item !== section));
        } else {
            setActiveAccordions([...activeAccordions, section]);
        }
    };

    return (
        <>
            <section className='px-4 py-8 md:px-6 md:py-10'>
                <div className="mb-8 md:mb-10 bg-gray-100 py-4 md:py-6 rounded-lg px-4 md:px-5">
                    <h1 className="font-semibold text-2xl md:text-3xl flex items-center">
                        <FaAngleDoubleLeft size={20} className="cursor-pointer mr-2" onClick={() => window.history.back()} /> Orders / {id}
                    </h1>
                </div>

                {
                    !order ?
                        (
                            <div className="flex justify-center items-center font-semibold text-base">
                                <Loading />
                            </div>
                        )
                        :
                        (
                            <div className='flex flex-col lg:flex-row items-stretch justify-between gap-5'>
                                {/* Accordion for User Details */}
                                <div className='w-full lg:w-2/3'>
                                    {user && user.role === 'admin' && (
                                        <div className='bg-gray-100 rounded-lg mb-5'>
                                            <div className='cursor-pointer p-5 flex justify-between items-center' onClick={() => toggleAccordion('userDetails')}>
                                                <h2 className='font-semibold text-base md:text-lg'>User Details</h2>
                                                <span className='text-2xl'>{activeAccordions.includes('userDetails') ? '-' : '+'}</span>
                                            </div>
                                            {activeAccordions.includes('userDetails') && (
                                                <div className='p-5'>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='text-base'><span className='font-bold'>Name:</span> {order.user_name}</p>
                                                        <p className='text-base'><span className='font-bold'>Email:</span> {order.user_email}</p>
                                                    </div>
                                                    <hr className='my-4' />
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='text-base'><span className='font-bold'>Payer Name:</span> {order.order.payer_name}</p>
                                                        <p className='text-base'><span className='font-bold '>Payer Email:</span> {order.order.payer_email}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}



                                    {/* Accordion for Order Status */}
                                    <div className='bg-gray-100 rounded-lg mb-5'>
                                        <div className='cursor-pointer p-5 flex justify-between items-center' onClick={() => toggleAccordion('orderStatus')}>
                                            <h2 className='font-semibold text-base md:text-lg'>Order Status</h2>
                                            <span className='text-2xl'>{activeAccordions.includes('orderStatus') ? '-' : '+'}</span>
                                        </div>
                                        {activeAccordions.includes('orderStatus') && (
                                            <div className='p-5 flex items-center gap-5'>
                                                <select value={orderStatus} onChange={handleStatusChange} className="text-sm md:text-base bg-white border border-gray-300 p-2 rounded-md">
                                                    {Object.entries(orderStatusMapping).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Accordion for Services Purchased with Revisions */}
                                    <div className='bg-gray-100 rounded-lg mb-5'>
                                        <div className='cursor-pointer p-5 flex justify-between items-center' onClick={() => toggleAccordion('servicesPurchased')}>
                                            <h2 className='font-semibold text-base md:text-lg'>Services Purchased</h2>
                                            <span className='text-2xl'>{activeAccordions.includes('servicesPurchased') ? '-' : '+'}</span>
                                        </div>
                                        {activeAccordions.includes('servicesPurchased') && (
                                            <ul className='p-5 flex flex-col gap-5'>
                                                {order.order_items.map((item) => (
                                                    <li key={item.id} className='bg-gray-100 rounded-lg'>
                                                        <div className='flex justify-between items-center'>
                                                            <p className={`font-semibold text-sm md:text-base ${(user && user.role === 'admin') ? 'w-2/3' : "w-full"}`}>{item.name}</p>
                                                            {user && user.role === 'admin' && (
                                                                <p className='text-sm md:text-base bg-green-600 text-center text-white px-2 py-1 rounded-full'>${item.total_price} / {item.service_type.replace('_', ' ')}</p>
                                                            )}
                                                        </div>

                                                        {/* Display Revisions for this Service */}
                                                        {revisions.length > 0 && revisions
                                                            .filter(rev => rev.service_id === item.service_id)
                                                            .map((revision) => (
                                                                <div key={revision.id} className='mt-4 p-4 bg-gray-200 rounded-lg'>
                                                                    <div className='flex justify-between items-center mb-5'>
                                                                        <h2 className='font-semibold text-base md:text-lg'>Revision #{revision.id}</h2>

                                                                        <button
                                                                            onClick={() => openRevisionModal(revision.id)}
                                                                            className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg"
                                                                        >
                                                                            Upload Revision Files
                                                                        </button>
                                                                    </div>
                                                                    <p className='text-sm md:text-base p-4 bg-gray-100 rounded-lg mb-5'>
                                                                        <span className='font-medium'>Revision Message:</span> {revision.message || 'No message provided'}
                                                                    </p>


                                                                    {revision.files && JSON.parse(revision.files).length > 0 && (
                                                                        <>
                                                                            <h2 className='font-semibold text-sm md:text-base'>Uploaded Files</h2>

                                                                            <ul className='mt-3'>
                                                                                {JSON.parse(revision.files).map((file, index) => (
                                                                                    <li key={index} className='flex justify-between items-center p-2 bg-gray-100 rounded-lg mb-2'>
                                                                                        <audio controls className='w-full'>
                                                                                            <source src={`${Asset_Endpoint}${file}`} type="audio/mpeg" />
                                                                                        </audio>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </>
                                                                    )}

                                                                    <p className='text-sm md:text-base p-4 bg-gray-100 rounded-lg mb-5'>
                                                                        <span className='font-medium'>Open At:</span> {(new Date(revision.created_at).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})) || 'No message provided'}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>


                                {/* Accordion for File Share */}
                                <div className='w-full lg:w-1/3'>
                                    <div className='bg-gray-100 rounded-lg'>
                                        <div className='cursor-pointer p-5 flex justify-between items-center' onClick={() => toggleAccordion('fileShare')}>
                                            <h2 className='font-semibold text-base md:text-lg'>Deliverable Files</h2>
                                            <span className='text-2xl'>{activeAccordions.includes('fileShare') ? '-' : '+'}</span>
                                        </div>
                                        {activeAccordions.includes('fileShare') && (
                                            <>
                                                <div className='p-5'>
                                                    <div className='flex justify-between items-center mb-5'>
                                                        <h2 className='font-semibold text-sm md:text-base'>Uploaded Files ({files?.length ? files.length : 0})</h2>
                                                        <button onClick={openGeneralModal} className='text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg'>Upload Files</button>
                                                    </div>

                                                    <ul className='flex flex-col gap-5 p-5 bg-gray-200 rounded-lg'>
                                                        {files?.length > 0 ? (
                                                            files.map((file, index) => (
                                                                <li key={index} className='flex justify-between items-center p-2 bg-gray-100 rounded-lg'>
                                                                    <audio controls className='w-full'>
                                                                        <source src={`${Asset_Endpoint}${file}`} type="audio/mpeg" />
                                                                    </audio>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className='flex justify-between items-center p-1 bg-gray-200 rounded-lg'>
                                                                <p className='text-sm md:text-base'>No files uploaded yet</p>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                }
            </section>

            {/* General File Upload Modal */}
            <Modal
                isOpen={generalModalIsOpen}
                onRequestClose={closeGeneralModal}
                contentLabel="Upload Files"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Upload Files</h2>
                    <form onSubmit={handleGeneralFileSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="files">Select Files</label>
                            <input
                                type="file"
                                name="files"
                                className="w-full px-3 py-2 border rounded-md"
                                multiple
                                onChange={handleGeneralFileUpload}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeGeneralModal}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Revision File Upload Modal */}
            <Modal
                isOpen={revisionModalIsOpen}
                onRequestClose={closeRevisionModal}
                contentLabel="Upload Revision Files"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Upload Revision Files</h2>
                    <form onSubmit={handleRevisionFileSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="files">Select Files</label>
                            <input
                                type="file"
                                name="files"
                                className="w-full px-3 py-2 border rounded-md"
                                multiple
                                onChange={handleRevisionFileUpload}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeRevisionModal}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg"
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