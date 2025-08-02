import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import { FaAngleDoubleLeft } from "react-icons/fa";

const ServiceDetail = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchServiceDetail = async (serviceId) => {
            setLoading(true);
            try {
                const response = await axios({
                    method: "get",
                    url: `${API_Endpoint}admin/services/${serviceId}`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    }
                });
                setService(response.data);
            } catch (error) {
                console.error("Error fetching service detail", error);
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
                toast.error("Error fetching service detail.", {
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
                setLoading(false);
            }
        };

        fetchServiceDetail(id);
    }, [id, dispatch, user.token]);

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
                            <h1 className="page-title dark-text">Service Details</h1>
                            <p className="page-subtitle dark-text-secondary">Service #{id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                <div className='flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-5'>
                    <div className='lg:w-2/3 flex flex-col gap-5'>
                        <div className='dark-card p-6 flex flex-col gap-5 border border-slate-700/50'>
                            <div className='flex flex-col gap-4'>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Name:</strong> {service?.name || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Category:</strong> {service.category?.name || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Label:</strong> {service.label?.name || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Price Before:</strong> ${service.price || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Price After:</strong> ${service.discounted_price || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Discount:</strong> {service.discounted_price ? `${((1 - service.discounted_price / service.price) * 100).toFixed(0)}%` : '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Service Type:</strong> {service.service_type || '-'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Created At:</strong> {new Date(service.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                        <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Last Updated:</strong> {new Date(service.updatedAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Detail:</strong> {service.detail || '-'}</p>
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Brief Detail:</strong></p>
                                    <div className="mt-2 dark-text-muted" dangerouslySetInnerHTML={{ __html: service.brief_detail || '-' }} />
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Includes:</strong></p>
                                    <div className="mt-2 dark-text-muted" dangerouslySetInnerHTML={{ __html: service.includes || '-' }} />
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Description:</strong></p>
                                    <div className="mt-2 dark-text-muted" dangerouslySetInnerHTML={{ __html: service.description || '-' }} />
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Requirements:</strong></p>
                                    <div className="mt-2 dark-text-muted" dangerouslySetInnerHTML={{ __html: service.requirements || '-' }} />
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Notes:</strong></p>
                                    <div className="mt-2 dark-text-muted" dangerouslySetInnerHTML={{ __html: service.notes || '-' }} />
                                </div>

                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold text-lg dark-text'>Tags:</strong> {service.tags || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='lg:w-1/3 flex flex-col gap-5'>
                        <div className='dark-card p-6 border border-slate-700/50 rounded-lg'>
                            <div className='w-full flex justify-center items-center'>
                                <img 
                                    src={service.is_url == "1" ? service.image : `${Asset_Endpoint}${service.image}`} 
                                    alt={service.name} 
                                    className="max-h-60 md:max-h-80 w-full object-contain rounded-lg" 
                                />
                            </div>
                        </div>

                        <div className='dark-card p-6 border border-slate-700/50 rounded-lg'>
                            <h2 className='font-semibold text-xl md:text-2xl dark-text text-center mb-4'>Variations</h2>
                            
                            {service?.variation && service?.variation?.length > 0 ? (
                                <div className="space-y-3">
                                    {service?.variation?.map((variation, index) => (
                                        <div key={variation?.id || index} className='dark-card p-4 border border-slate-700/50 rounded-lg'>
                                            <p className="dark-text"><strong className='font-semibold dark-text'>Name:</strong> {variation?.name || '-'}</p>
                                            <p className="dark-text"><strong className='font-semibold dark-text'>Price Before:</strong> ${variation?.price || '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="dark-text-muted text-center">No variations available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceDetail;