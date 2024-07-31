import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaAngleDoubleLeft, FaDownload } from "react-icons/fa";
import axios from 'axios';
import { API_Endpoint } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { Slide, toast } from 'react-toastify';
import Modal from 'react-modal';
import { selectUser } from '../reducers/authSlice';

const OrderDetail = () => {
    const location = useLocation();
    const order = location.state.order;
    const [orderStatus, setOrderStatus] = useState(order.Order_status);
    const [files, setFiles] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const user = useSelector(selectUser);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        setOrderStatus(newStatus);

        try {
            await axios({
                method: "put",
                url: `${API_Endpoint}fetch/order/${order.id}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
                data: {
                    Order_status: newStatus
                }
            });

            toast.success('Order status updated successfully!', {
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
            console.error("Error updating order status", error);
            toast.error('Error updating order status.', {
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
        Array.from(selectedFiles).forEach(file => {
            formData.append('files[]', file);
        });

        try {
            await axios({
                method: 'post',
                url: `${API_Endpoint}fetch/order/${order.id}/upload`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });

            toast.success('Files uploaded successfully!', {
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

            closeModal();
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Error uploading files.', {
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
        }
    };

    console.log(order)

    return (
        <>
            <section className='px-5 py-10'>
                <div className="mb-10 bg-[#F6F6F6] py-6 rounded-lg px-5">
                    <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 flex items-center justify-start">
                        <FaAngleDoubleLeft size={20} className="cursor-pointer mr-2" onClick={() => window.history.back()} /> Orders / {order?.id}
                    </h1>
                </div>

                <div className='flex items-stretch justify-between gap-5'>
                    <div className='w-2/3 flex item-start justify-between gap-5'>
                        <div className='w-2/4 flex flex-col gap-5'>
                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex flex-col gap-5'>
                                <p className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>Order By:</p>

                                <div className='flex flex-col gap-2'>
                                    <h3 className='font-THICCCBOI-SemiBold font-semibold text-base leading-5'>{order.payer_name}</h3>
                                    <p className='font-THICCCBOI-Regular font-normal text-sm leading-3'>{order.payer_email}</p>
                                </div>
                            </div>

                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex items-center gap-5'>
                                <span className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>Order Status:</span>
                                <select value={orderStatus} onChange={handleStatusChange} className="font-THICCCBOI-Regular font-normal text-sm leading-3 bg-white border border-gray-300 p-2 rounded-md">
                                    <option value="Padding">Padding</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className='p-5 bg-[#F6F6F6] rounded-lg flex gap-5'>
                                <span className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>Purchased on:</span>
                                <span className='font-THICCCBOI-Regular font-normal text-sm leading-3'>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className='w-2/4 flex flex-col item-start gap-5'>
                            <h2 className='font-THICCCBOI-SemiBold font-semibold text-base leading-5 p-5 bg-[#F6F6F6] rounded-lg text-center'>Services Purchased</h2>
                            <ul className='flex flex-col item-start justify-between gap-5'>
                                {order.order_items.map((item) => (
                                    <li key={item.id} className='flex justify-between items-center p-5 bg-[#F6F6F6] rounded-lg'>
                                        <p className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3'>{item.name}</p>
                                        <p className='font-THICCCBOI-Regular font-normal text-sm leading-3 bg-[#4BC500] text-white p-2 rounded-full'>${item.total_price} / {item.service_type.replace('_', ' ')}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='w-1/3 flex flex-col gap-5'>
                        <div className='flex items-center justify-between bg-[#F6F6F6] p-5 rounded-lg'>
                            <h2 className='font-THICCCBOI-SemiBold font-semibold text-base leading-5'>File Share ({files.length})</h2>
                            <button onClick={openModal} className='font-THICCCBOI-SemiBold font-semibold text-sm leading-3 text-white bg-stone-900 p-4 rounded-lg'>Upload Files</button>
                        </div>

                        <ul className='flex flex-col item-start justify-between gap-5 bg-[#E9E9E9] p-5 rounded-lg'>
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <li key={index} className='flex justify-between items-center p-5 bg-[#F6F6F6] rounded-lg'>
                                        <p>{file.name}</p>
                                        <button className='bg-[#4BC500] text-white p-2 rounded-full'><FaDownload /></button>
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
                            >
                                Upload
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default OrderDetail;