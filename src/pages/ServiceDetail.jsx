import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        <section className='px-4 py-8 md:px-5 md:py-10 font-THICCCBOI-Regular'>
            <div className="mb-8 md:mb-10 bg-[#F6F6F6] py-4 md:py-6 rounded-lg px-4 md:px-5">
                <h1 className="font-THICCCBOI-SemiBold text-2xl md:text-3xl leading-7 md:leading-9 flex items-center">
                    <FaAngleDoubleLeft size={20} className="cursor-pointer mr-2" onClick={() => window.history.back()} /> Service Details / {id}
                </h1>
            </div>

            {
                loading ?
                    (
                        <div className="flex justify-center items-center font-THICCCBOI-Medium text-base">
                            <Loading />
                        </div>
                    )
                    :
                    (
                        <div className='flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-5'>
                            <div className='lg:w-2/3 flex flex-col gap-5'>
                                <div className='p-4 md:p-5 bg-[#F6F6F6] rounded-lg flex flex-col gap-5 font-THICCCBOI-Light'>
                                    <div className='flex flex-col gap-2'>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Name:</strong> {service?.name || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Category:</strong> {service.category?.name || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Label:</strong> {service.label?.name || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Price Before:</strong> ${service.price || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Price After:</strong> ${service.discounted_price || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Discount:</strong> {service.discounted_price ? `${((1 - service.discounted_price / service.price) * 100).toFixed(0)}%` : '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Service Type:</strong> {service.service_type || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Detail:</strong> {service.detail || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Brief Detail:</strong> <span dangerouslySetInnerHTML={{ __html: service.brief_detail || '-' }} /></p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Includes:</strong> <span dangerouslySetInnerHTML={{ __html: service.includes || '-' }} /></p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Description:</strong> <span dangerouslySetInnerHTML={{ __html: service.description || '-' }} /></p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Requirements:</strong> <span dangerouslySetInnerHTML={{ __html: service.requirements || '-' }} /></p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Notes:</strong> <span dangerouslySetInnerHTML={{ __html: service.notes || '-' }} /></p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Tags:</strong> {service.tags || '-'}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Created At:</strong> {new Date(service.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Last Updated:</strong> {new Date(service.updated_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='lg:w-1/3 flex flex-col gap-5'>
                                <div className='w-full flex justify-center items-center bg-[#F6F6F6] p-4 md:p-5 rounded-lg'>
                                    <img src={service.is_url == "1" ? service.image : `${Asset_Endpoint}${service.image}`} alt={service.name} className="max-h-60 md:max-h-80 w-full object-contain rounded-lg" />
                                </div>

                                <div key={service.id} className='p-4 md:p-5 bg-[#F6F6F6] rounded-lg flex flex-col gap-5 font-THICCCBOI-Light'>
                                    <h2 className='font-THICCCBOI-SemiBold text-xl md:text-2xl text-[#000000] text-center font-bold'>Variation</h2>
                                </div>

                                {service?.variation && service?.variation?.length > 0 &&
                                    service?.variation?.map((service) => (
                                        <div key={service?.id} className='flex flex-col gap-2 p-4 md:p-5 bg-[#F6F6F6] rounded-lg '>
                                            <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Name:</strong> {service?.name || '-'}</p>
                                            <p><strong className='font-THICCCBOI-SemiBold text-lg md:text-xl text-[#000000] font-bold'>Price Before:</strong> ${service?.price || '-'}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
            }
        </section>
    );
};

export default ServiceDetail;