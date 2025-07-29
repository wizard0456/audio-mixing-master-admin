import { useState, useEffect } from 'react';
import { FaAngleDoubleLeft } from "react-icons/fa";
import axios from 'axios';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';
import { API_Endpoint } from '../utilities/constants';
import { Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Loading from '../components/Loading';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [generalModalIsOpen, setGeneralModalIsOpen] = useState(false);
    const [revisionModalIsOpen, setRevisionModalIsOpen] = useState(false);
    const [selectedLinks, setSelectedLinks] = useState(['']);
    const [orderStatus, setOrderStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeAccordions, setActiveAccordions] = useState(["userDetails", "servicesPurchased"]);
    const [currentRevisionId, setCurrentRevisionId] = useState(null);
    const [revisions, setRevisions] = useState([]);
    const { id } = useParams();
    const user = useSelector(selectUser);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`${API_Endpoint}admin/order-details/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    },
                });
                setOrder(response.data);
                setOrderStatus(response.data.order.Order_status);
                setRevisions(response.data.revision);
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
        const toastId = toast.loading("Updating order status...");

        try {
            await axios(`${API_Endpoint}admin/order/update-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
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

            toast.update(toastId, {
                render: "Order status updated successfully",
                type: "success",
                isLoading: false,
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
            toast.update(toastId, {
                render: "Error updating order status",
                type: "error",
                isLoading: false,
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

    const openGeneralModal = () => {
        setGeneralModalIsOpen(true);
    };

    const closeGeneralModal = () => {
        setGeneralModalIsOpen(false);
        setSelectedService(null);
        setSelectedLinks(['']);
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...selectedLinks];
        newLinks[index] = value;
        setSelectedLinks(newLinks);
    };

    const addLinkField = () => {
        setSelectedLinks([...selectedLinks, '']);
    };

    const removeLinkField = (index) => {
        const newLinks = selectedLinks.filter((_, i) => i !== index);
        setSelectedLinks(newLinks.length > 0 ? newLinks : ['']);
    };

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleGeneralLinkSubmit = async (event) => {
        event.preventDefault();

        const validLinks = selectedLinks.filter(link => link.trim() !== '');

        if (validLinks.length === 0) {
            toast.error("Please provide at least one valid link", {
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

        const invalidLinks = validLinks.filter(link => !validateUrl(link));
        if (invalidLinks.length > 0) {
            toast.error("Please provide valid URLs only", {
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

        setIsUploading(true);

        try {
            const response = await axios.post(`${API_Endpoint}admin/order/upload-file/${id}`, {
                deliverable_links: validLinks,
                order_item_id: selectedService,
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            setOrderStatus(response.data.Order_status.toString());
            setOrder({
                ...order, order_items: order.order_items.map((item) => {
                    if (item.id === selectedService) {
                        return response.data.order_item;
                    }
                    return item;
                })
            });

            toast.success("Links uploaded successfully", {
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
            toast.error("Error uploading links", {
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

    const openRevisionModal = (revisionId) => {
        setCurrentRevisionId(revisionId);
        setRevisionModalIsOpen(true);
    };

    const closeRevisionModal = () => {
        setRevisionModalIsOpen(false);
        setSelectedLinks(['']);
        setCurrentRevisionId(null);
    };

    const handleRevisionLinkSubmit = async (event) => {
        event.preventDefault();

        if (!currentRevisionId) {
            toast.error("Revision ID not found");
            return;
        }
        const validLinks = selectedLinks.filter(link => link.trim() !== '');

        if (validLinks.length === 0) {
            toast.error("Please provide at least one valid link", {
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

        const invalidLinks = validLinks.filter(link => !validateUrl(link));
        if (invalidLinks.length > 0) {
            toast.error("Please provide valid URLs only", {
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

        setIsUploading(true);
        try {
            const response = await axios.post(`${API_Endpoint}admin/revisions/upload/${currentRevisionId}`, { links: validLinks }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            setRevisions(response.data.revision);
            setOrderStatus(response.data.order_status.toString());

            toast.success("Revision links uploaded successfully", {
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
            toast.error("Error uploading revision links", {
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

    async function handleRevisionReaded(itemId) {
        try {
            const response = await axios({
                method: "post",
                url: `${API_Endpoint}admin/revisions/admin-flag/${id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                data: {
                    admin_is_read: "1",
                    type: "revision",
                    order_item_id: itemId
                }
            });

            setRevisions(response.data);
        } catch (error) {
            console.error("Error reading revision", error);
        }
    }

    const getRevisionsForItem = (itemId) => {
        return revisions.filter(revision => revision.service_id === itemId).sort((a, b) => a.id - b.id);
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
                    !order ? (
                        <div className="flex justify-center items-center font-semibold text-base">
                            <Loading />
                        </div>
                    ) : (
                        <div className='flex flex-col lg:flex-row items-stretch justify-between gap-5'>
                            {/* Accordion for User Details */}
                            <div className='w-full'>
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

                                                {Number(order?.is_giftcard) != 1 && (
                                                    <>
                                                        <hr className='my-4' />
                                                        <p className='text-base'><span className='font-bold mr-2'>Order Status:</span>
                                                            <select value={orderStatus} onChange={handleStatusChange} className="text-sm md:text-base bg-white border border-gray-300 p-2 rounded-md">
                                                                {Object.entries(orderStatusMapping).map(([key, value]) => (
                                                                    <option key={key} value={key}>{value}</option>
                                                                ))}
                                                            </select>
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {Number(order?.is_giftcard) == 1 ? (
                                    <div className='bg-gray-100 rounded-lg mb-5'>
                                        <div className='p-5 flex justify-between items-center'>
                                            <h2 className='font-semibold text-base md:text-lg'>Services Purchased</h2>
                                        </div>
                                        <ul>
                                            {order.order_items.map((item) => (
                                                <li key={item.id} className='bg-gray-100 rounded-lg p-5 flex flex-col gap-5 '>
                                                    <div className='flex justify-evenly gap-2'>
                                                        <p className='text-base flex flex-col items-center'><span className='font-bold'>Name</span> {item.name}</p>
                                                        <p className='text-base flex flex-col items-center'><span className='font-bold'>Price</span> {item.price}</p>
                                                        <p className='text-base flex flex-col items-center'><span className='font-bold'>Quantity</span> {item.quantity}</p>
                                                        <p className='text-base flex flex-col items-center'><span className='font-bold'>Total</span> {item.total_price}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className='mb-5'>
                                        <div className={`p-5 flex justify-between items-center rounded-lg relative bg-gray-100 mb-5`} onClick={() => toggleAccordion('servicesPurchased')}>
                                            <h2 className='font-semibold text-base md:text-lg'>Services Purchased</h2>
                                            <span className='text-2xl'>{activeAccordions.includes('servicesPurchased') ? '-' : '+'}</span>
                                        </div>
                                        {activeAccordions.includes('servicesPurchased') && (
                                            <ul className='flex flex-col gap-5'>
                                                {order.order_items.map((item) => (
                                                    <li key={item.id} className={`bg-gray-100 rounded-lg p-5 flex flex-col gap-5 ${(getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) ? "cursor-pointer relative" : ""}`}
                                                        onClick={() => {
                                                            if (getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) {
                                                                handleRevisionReaded(item.id);
                                                            }
                                                        }}>
                                                        {(getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) && (
                                                            <span className='absolute -top-2 -left-3 bg-[#4CC800] text-white font-THICCCBOI-Medium text-sm px-3 py-1 rounded-full'>New Revision</span>
                                                        )}
                                                        <div className='flex justify-between items-center'>
                                                            <h3 className={`text-xl font-bold`}>{item.name}</h3>
                                                            <div className='flex gap-2'>
                                                                <button onClick={() => {
                                                                    openGeneralModal();
                                                                    setSelectedService(item.id);
                                                                }} className='text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg'>Upload Deliverable Links</button>
                                                            </div>
                                                        </div>
                                                        <div className='flex justify-between items-center bg-gray-200 rounded-lg p-5'>
                                                            <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center`}>
                                                                <span className='text-base font-bold'>Service Type</span>{item.service_type}
                                                            </p>
                                                            <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center`}>
                                                                <span className='text-base font-bold'>Max Revisions</span>{item.max_revision}
                                                            </p>
                                                            {user && user.role === 'admin' && (
                                                                <>
                                                                    <p className='text-sm md:text-basetext-center w-full flex flex-col items-center justify-center'>
                                                                        <span className='text-base font-bold'>Price</span>
                                                                        <span className='bg-green-600 text-white px-2 py-1 rounded-full'>${item.price} / {item.service_type.replace('_', ' ')}</span>
                                                                    </p>
                                                                </>
                                                            )}
                                                            <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center`}>
                                                                <span className='text-base font-bold'>Quantity</span>{item.quantity}
                                                            </p>
                                                            {user && user.role === 'admin' && (
                                                                <>
                                                                    <p className='text-sm md:text-basetext-center w-full flex flex-col items-center justify-center'>
                                                                        <span className='text-base font-bold'>Total Price</span>
                                                                        <span className='bg-green-600 text-white px-2 py-1 rounded-full'>${item.total_price} / {item.service_type.replace('_', ' ')}</span>
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className={`flex ${JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 ? "justify-between" : "justify-end"} gap-5 items-start`}>
                                                            {JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 && (
                                                                <div className='p-4 bg-gray-200 rounded-lg w-full lg:w-1/2'>
                                                                    {JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 && <p className='text-sm md:text-base font-bold mb-4'>Deliverable Links ({JSON.parse(item.deliverable_files)?.length})</p>}

                                                                    <ul className='flex flex-col gap-3'>
                                                                        {JSON.parse(item.deliverable_files).map((link, index) => (
                                                                            <li key={index} className='flex justify-between items-center p-3 bg-gray-100 rounded-lg'>
                                                                                <a
                                                                                    href={link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className='text-blue-600 hover:text-blue-800 underline break-all'
                                                                                >
                                                                                    {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                                                                                </a>
                                                                                <button
                                                                                    onClick={() => navigator.clipboard.writeText(link)}
                                                                                    className='ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'
                                                                                    title="Copy link"
                                                                                >
                                                                                    Copy
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className='flex flex-col gap-4 w-full lg:w-1/2'>
                                                                {getRevisionsForItem(item.service_id)
                                                                    .reverse()
                                                                    .map((revision) => (
                                                                        <div key={revision.id} className='p-4 bg-gray-200 rounded-lg'>
                                                                            <div className='flex justify-between items-center mb-5'>
                                                                                <h2 className='font-semibold text-base md:text-lg'>Revision #{revision.id}</h2>

                                                                                <button onClick={() => openRevisionModal(revision.id)} className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg">
                                                                                    Upload Revision Links
                                                                                </button>
                                                                            </div>
                                                                            <p className='text-sm md:text-base p-4 bg-gray-100 rounded-lg mb-5'>
                                                                                <span className='font-medium'>Revision Message:</span> {revision.message || 'No message provided'}
                                                                            </p>

                                                                            {revision.files && JSON.parse(revision.files).length > 0 && (
                                                                                <>
                                                                                    <h2 className='font-semibold text-sm md:text-base'>Uploaded Links</h2>
                                                                                    <ul className='mt-3'>
                                                                                        {JSON.parse(revision.files).map((link, index) => (
                                                                                            <li key={index} className='flex justify-between items-center p-3 bg-gray-100 rounded-lg mb-2'>
                                                                                                <a
                                                                                                    href={link}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className='text-blue-600 hover:text-blue-800 underline break-all'
                                                                                                >
                                                                                                    {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                                                                                                </a>
                                                                                                <button
                                                                                                    onClick={() => navigator.clipboard.writeText(link)}
                                                                                                    className='ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'
                                                                                                    title="Copy link"
                                                                                                >
                                                                                                    Copy
                                                                                                </button>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </>
                                                                            )}

                                                                            <p className='text-sm md:text-base p-4 bg-gray-100 rounded-lg'>
                                                                                <span className='font-medium'>Requested At:</span> {(new Date(revision.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })) || 'No message provided'}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </section>

            {/* General Link Upload Modal */}
            <Modal isOpen={generalModalIsOpen} onRequestClose={closeGeneralModal} contentLabel="Upload Links">
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Upload Deliverable Links</h2>
                    <form onSubmit={handleGeneralLinkSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deliverable Links</label>
                            {selectedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        placeholder="https://example.com/your-deliverable-link"
                                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required={index === 0 || link.trim() !== ''}
                                    />
                                    {selectedLinks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLinkField(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkField}
                                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 mt-2"
                            >
                                Add Another Link
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded" onClick={closeGeneralModal}>
                                Close
                            </button>
                            <button type="submit" className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload Links'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Revision Link Upload Modal */}
            <Modal isOpen={revisionModalIsOpen} onRequestClose={closeRevisionModal} contentLabel="Upload Revision Links">
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Upload Revision Links</h2>
                    <form onSubmit={handleRevisionLinkSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Revision Links</label>
                            {selectedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        placeholder="https://example.com/your-revision-link"
                                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required={index === 0 || link.trim() !== ''}
                                    />
                                    {selectedLinks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLinkField(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkField}
                                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 mt-2"
                            >
                                Add Another Link
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded" onClick={closeRevisionModal}>
                                Close
                            </button>
                            <button type="submit" className="text-sm md:text-base bg-green-600 text-white px-5 py-2 rounded-lg" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload Links'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default OrderDetail;