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
            console.error("Error updating order status", error);
        }
    };

    const openGeneralModal = () => {
        setGeneralModalIsOpen(true);
    };

    const closeGeneralModal = () => {
        setGeneralModalIsOpen(false);
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
        setSelectedLinks(newLinks);
    };

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleGeneralLinkSubmit = async (event) => {
        event.preventDefault();
        setIsUploading(true);

        const validLinks = selectedLinks.filter(link => link.trim() !== '' && validateUrl(link.trim()));

        if (validLinks.length === 0) {
            toast.error('Please provide at least one valid URL', {
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
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('service_id', selectedService);
        formData.append('files', JSON.stringify(validLinks));

        try {
            await axios.post(`${API_Endpoint}admin/order/upload-file/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Links uploaded successfully', {
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
            // Refresh order data
            const response = await axios.get(`${API_Endpoint}admin/order-details/${id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
            });
            setOrder(response.data);
        } catch (error) {
            console.error('Error uploading links:', error);
            toast.error('Error uploading links', {
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
        setIsUploading(true);

        const validLinks = selectedLinks.filter(link => link.trim() !== '' && validateUrl(link.trim()));

        if (validLinks.length === 0) {
            toast.error('Please provide at least one valid URL', {
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
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('revision_id', currentRevisionId);
        formData.append('files', JSON.stringify(validLinks));

        try {
            await axios.post(`${API_Endpoint}admin/order/upload-revision-file/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Revision links uploaded successfully', {
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
            // Refresh order data
            const response = await axios.get(`${API_Endpoint}admin/order-details/${id}`, {
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
            });
            setOrder(response.data);
        } catch (error) {
            console.error('Error uploading revision links:', error);
            toast.error('Error uploading revision links', {
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
        setActiveAccordions(prev => 
            prev.includes(section) 
                ? prev.filter(item => item !== section)
                : [...prev, section]
        );
    };

    async function handleRevisionReaded(itemId) {
        try {
            await axios.post(`${API_Endpoint}admin/revisions/admin-flag/${itemId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            // Update local state to mark as read
            setRevisions(prevRevisions => 
                prevRevisions.map(revision => 
                    revision.service_id === itemId 
                        ? { ...revision, admin_is_read: 1 }
                        : revision
                )
            );
        } catch (error) {
            console.error('Error marking revision as read:', error);
        }
    }

    const getRevisionsForItem = (itemId) => {
        return revisions.filter(revision => revision.service_id === itemId).sort((a, b) => a.id - b.id);
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FaAngleDoubleLeft 
                            size={20} 
                            className="cursor-pointer mr-3 text-slate-400 hover:text-white transition-colors" 
                            onClick={() => window.history.back()} 
                        />
                        <div>
                            <h1 className="page-title dark-text">Order Details</h1>
                            <p className="page-subtitle dark-text-secondary">Order #{id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {!order ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                <div className='flex flex-col lg:flex-row items-stretch justify-between gap-5'>
                    {/* Accordion for User Details */}
                    <div className='w-full'>
                        {user && user.role === 'admin' && (
                            <div className='dark-card rounded-lg mb-5 border border-slate-700/50'>
                                <div className='cursor-pointer p-5 flex justify-between items-center' onClick={() => toggleAccordion('userDetails')}>
                                    <h2 className='font-semibold text-base md:text-lg dark-text'>User Details</h2>
                                    <span className='text-2xl dark-text'>{activeAccordions.includes('userDetails') ? '-' : '+'}</span>
                                </div>
                                {activeAccordions.includes('userDetails') && (
                                    <div className='p-5 border-t border-slate-700/50'>
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base dark-text'><span className='font-bold'>Name:</span> {order.user_name}</p>
                                            <p className='text-base dark-text'><span className='font-bold'>Email:</span> {order.user_email}</p>
                                        </div>
                                        <hr className='my-4 border-slate-700/50' />
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-base dark-text'><span className='font-bold'>Payer Name:</span> {order.order.payer_name}</p>
                                            <p className='text-base dark-text'><span className='font-bold'>Payer Email:</span> {order.order.payer_email}</p>
                                        </div>

                                        {Number(order?.is_giftcard) != 1 && (
                                            <>
                                                <hr className='my-4 border-slate-700/50' />
                                                <p className='text-base dark-text'><span className='font-bold mr-2'>Order Status:</span>
                                                    <select value={orderStatus} onChange={handleStatusChange} className="text-sm md:text-base modern-input ml-2">
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
                            <div className='dark-card rounded-lg mb-5 border border-slate-700/50'>
                                <div className='p-5 flex justify-between items-center'>
                                    <h2 className='font-semibold text-base md:text-lg dark-text'>Services Purchased</h2>
                                </div>
                                <ul>
                                    {order.order_items.map((item) => (
                                        <li key={item.id} className='dark-card rounded-lg p-5 flex flex-col gap-5 border border-slate-700/50 m-5'>
                                            <div className='flex justify-evenly gap-2'>
                                                <p className='text-base flex flex-col items-center dark-text'><span className='font-bold'>Name</span> {item.name}</p>
                                                <p className='text-base flex flex-col items-center dark-text'><span className='font-bold'>Price</span> {item.price}</p>
                                                <p className='text-base flex flex-col items-center dark-text'><span className='font-bold'>Quantity</span> {item.quantity}</p>
                                                <p className='text-base flex flex-col items-center dark-text'><span className='font-bold'>Total</span> {item.total_price}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className='mb-5'>
                                <div className={`p-5 flex justify-between items-center rounded-lg relative dark-card border border-slate-700/50 mb-5`} onClick={() => toggleAccordion('servicesPurchased')}>
                                    <h2 className='font-semibold text-base md:text-lg dark-text'>Services Purchased</h2>
                                    <span className='text-2xl dark-text'>{activeAccordions.includes('servicesPurchased') ? '-' : '+'}</span>
                                </div>
                                {activeAccordions.includes('servicesPurchased') && (
                                    <ul className='flex flex-col gap-5'>
                                        {order.order_items.map((item) => (
                                            <li key={item.id} className={`dark-card rounded-lg p-5 flex flex-col gap-5 border border-slate-700/50 ${(getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) ? "cursor-pointer relative" : ""}`}
                                                onClick={() => {
                                                    if (getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) {
                                                        handleRevisionReaded(item.id);
                                                    }
                                                }}>
                                                {(getRevisionsForItem(item.service_id).filter((item) => ((item.admin_is_read == 0))).length > 0) && (
                                                    <span className='absolute -top-2 -left-3 bg-green-500 text-white font-THICCCBOI-Medium text-sm px-3 py-1 rounded-full'>New Revision</span>
                                                )}
                                                <div className='flex justify-between items-center'>
                                                    <h3 className={`text-xl font-bold dark-text`}>{item.name}</h3>
                                                    <div className='flex gap-2'>
                                                        <button onClick={() => {
                                                            openGeneralModal();
                                                            setSelectedService(item.id);
                                                        }} className='btn-primary'>Upload Deliverable Links</button>
                                                    </div>
                                                </div>
                                                <div className='flex justify-between items-center dark-card rounded-lg p-5 border border-slate-700/50'>
                                                    <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center dark-text`}>
                                                        <span className='text-base font-bold'>Service Type</span>{item.service_type}
                                                    </p>
                                                    <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center dark-text`}>
                                                        <span className='text-base font-bold'>Max Revisions</span>{item.max_revision}
                                                    </p>
                                                    {user && user.role === 'admin' && (
                                                        <>
                                                            <p className='text-sm md:text-base text-center w-full flex flex-col items-center justify-center dark-text'>
                                                                <span className='text-base font-bold'>Price</span>
                                                                <span className='bg-green-500 text-white px-2 py-1 rounded-full'>${item.price} / {item.service_type.replace('_', ' ')}</span>
                                                            </p>
                                                        </>
                                                    )}
                                                    <p className={`font-semibold text-sm md:text-base w-full flex flex-col items-center justify-center dark-text`}>
                                                        <span className='text-base font-bold'>Quantity</span>{item.quantity}
                                                    </p>
                                                    {user && user.role === 'admin' && (
                                                        <>
                                                            <p className='text-sm md:text-base text-center w-full flex flex-col items-center justify-center dark-text'>
                                                                <span className='text-base font-bold'>Total Price</span>
                                                                <span className='bg-green-500 text-white px-2 py-1 rounded-full'>${item.total_price} / {item.service_type.replace('_', ' ')}</span>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>

                                                <div className={`flex ${JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 ? "justify-between" : "justify-end"} gap-5 items-start`}>
                                                    {JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 && (
                                                        <div className='p-4 dark-card rounded-lg w-full lg:w-1/2 border border-slate-700/50'>
                                                            {JSON.parse(item.deliverable_files) && JSON.parse(item.deliverable_files)?.length > 0 && <p className='text-sm md:text-base font-bold mb-4 dark-text'>Deliverable Links ({JSON.parse(item.deliverable_files)?.length})</p>}

                                                            <ul className='flex flex-col gap-3'>
                                                                {JSON.parse(item.deliverable_files).map((link, index) => (
                                                                    <li key={index} className='flex justify-between items-center p-3 dark-card rounded-lg border border-slate-700/50'>
                                                                        <a
                                                                            href={link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className='text-blue-400 hover:text-blue-300 underline break-all'
                                                                        >
                                                                            {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                                                                        </a>
                                                                        <button
                                                                            onClick={() => navigator.clipboard.writeText(link)}
                                                                            className='ml-2 text-sm btn-primary px-2 py-1'
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
                                                                <div key={revision.id} className='p-4 dark-card rounded-lg border border-slate-700/50'>
                                                                    <div className='flex justify-between items-center mb-5'>
                                                                        <h2 className='font-semibold text-base md:text-lg dark-text'>Revision #{revision.id}</h2>

                                                                        <button onClick={() => openRevisionModal(revision.id)} className="btn-primary">
                                                                            Upload Revision Links
                                                                        </button>
                                                                    </div>
                                                                    <p className='text-sm md:text-base p-4 dark-card rounded-lg mb-5 border border-slate-700/50'>
                                                                        <span className='font-medium dark-text'>Revision Message:</span> {revision.message || 'No message provided'}
                                                                    </p>

                                                                    {revision.files && JSON.parse(revision.files).length > 0 && (
                                                                        <>
                                                                            <h2 className='font-semibold text-sm md:text-base dark-text'>Uploaded Links</h2>
                                                                            <ul className='mt-3'>
                                                                                {JSON.parse(revision.files).map((link, index) => (
                                                                                    <li key={index} className='flex justify-between items-center p-3 dark-card rounded-lg mb-2 border border-slate-700/50'>
                                                                                        <a
                                                                                            href={link}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className='text-blue-400 hover:text-blue-300 underline break-all'
                                                                                        >
                                                                                            {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                                                                                        </a>
                                                                                        <button
                                                                                            onClick={() => navigator.clipboard.writeText(link)}
                                                                                            className='ml-2 text-sm btn-primary px-2 py-1'
                                                                                            title="Copy link"
                                                                                        >
                                                                                            Copy
                                                                                        </button>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </>
                                                                    )}

                                                                    <p className='text-sm md:text-base p-4 dark-card rounded-lg border border-slate-700/50'>
                                                                        <span className='font-medium dark-text'>Requested At:</span> {(new Date(revision.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })) || 'No message provided'}
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

            {/* General Link Upload Modal */}
            <Modal isOpen={generalModalIsOpen} onRequestClose={closeGeneralModal} contentLabel="Upload Links" className="modern-modal">
                <div>
                    <h2 className="text-2xl mb-4 font-semibold dark-text">Upload Deliverable Links</h2>
                    <form onSubmit={handleGeneralLinkSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium dark-text-muted mb-2">Deliverable Links</label>
                            {selectedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        placeholder="https://example.com/your-deliverable-link"
                                        className="modern-input flex-1"
                                        required={index === 0 || link.trim() !== ''}
                                    />
                                    {selectedLinks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLinkField(index)}
                                            className="btn-secondary"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkField}
                                className="btn-primary mt-2"
                            >
                                Add Another Link
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" className="btn-secondary" onClick={closeGeneralModal}>
                                Close
                            </button>
                            <button type="submit" className="btn-primary" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload Links'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Revision Link Upload Modal */}
            <Modal isOpen={revisionModalIsOpen} onRequestClose={closeRevisionModal} contentLabel="Upload Revision Links" className="modern-modal">
                <div>
                    <h2 className="text-2xl mb-4 font-semibold dark-text">Upload Revision Links</h2>
                    <form onSubmit={handleRevisionLinkSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium dark-text-muted mb-2">Revision Links</label>
                            {selectedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        placeholder="https://example.com/your-revision-link"
                                        className="modern-input flex-1"
                                        required={index === 0 || link.trim() !== ''}
                                    />
                                    {selectedLinks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLinkField(index)}
                                            className="btn-secondary"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLinkField}
                                className="btn-primary mt-2"
                            >
                                Add Another Link
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" className="btn-secondary" onClick={closeRevisionModal}>
                                Close
                            </button>
                            <button type="submit" className="btn-primary" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload Links'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default OrderDetail;