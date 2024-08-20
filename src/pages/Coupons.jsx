import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import Modal from 'react-modal';
import Loading from '../components/Loading';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const user = useSelector(selectUser);
    const abortController = useRef(null);
    const [couponDetails, setCouponDetails] = useState(null);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
    const [services, setServices] = useState([]); // Define services state here
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons(currentPage, filter);
        fetchServices(); // Fetch services when the component mounts
    }, [currentPage, filter]);

    const fetchCoupons = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/coupons?page=${page}&per_page=${Per_Page}`;
        if (filter !== 'all') {
            url += `&is_active=${filter}`;
        }

        try {
            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
                signal: abortController.current.signal,
            });

            setCoupons(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching coupons", error);
                setLoading(false);
                toast.error('Error fetching coupons', {
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
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get('https://music.zetdigi.com/backend/public/api/services-list');
            const servicesOptions = response.data
                .filter(service => service.service_type !== "subscription")
                .map(service => ({
                    value: service.id,
                    label: service.name
                }));

            console.log(servicesOptions);

            setServices(servicesOptions); // Store the services in the state
        } catch (error) {
            console.error('Error fetching services', error);
            toast.error('Error fetching services', {
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

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const openAddCouponPage = () => {
        navigate('/add-coupons');
    };

    const fetchCouponDetails = async (couponId) => {
        setCouponDetails(null); // Reset coupon details
        setViewModalIsOpen(true); // Open the modal immediately

        try {
            const response = await axios({
                method: 'get',
                url: `${API_Endpoint}admin/coupons/${couponId}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            setCouponDetails(response.data);
        } catch (error) {
            console.error('Error fetching coupon details', error);
            toast.error('Error fetching coupon details', {
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

    const closeViewModal = () => {
        setViewModalIsOpen(false);
        setCouponDetails(null);
    };

    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-9">Coupons</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Coupons
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Coupons
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Coupons
                    </button>
                </div>
                <button
                    onClick={openAddCouponPage}
                    className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                >
                    Add Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                coupons?.length !== 0 ? (
                    <div className="overflow-x-auto">
                        <table className='w-full border-0'>
                            <thead>
                                <tr>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Code</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Discount Type</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Discount Value</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Max Uses</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Uses</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Start Date</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">End Date</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Status</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons?.map(coupon => (
                                    <tr key={coupon.id}>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{coupon.code}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.discount_type}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.discount_value}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.max_uses == null ? 'Unlimited' : coupon.max_uses}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.uses}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(coupon.start_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No Expiry'}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <button onClick={() => fetchCouponDetails(coupon.id)}><FaEye color="#969696" /></button>
                                                <Link to={"/update-coupons"} state={coupon}><TiPencil color="#969696" /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No coupons found
                    </div>
                )
            )}

            {
                loading || (
                    coupons?.length !== 0 && (
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
                                forcePage={currentPage - 1}
                            />
                        </div>
                    )
                )
            }

            <Modal
                isOpen={viewModalIsOpen}
                onRequestClose={closeViewModal}
                contentLabel="View Coupon Details"
            >
                <div>
                    <h2 className="text-xl md:text-2xl mb-4 font-semibold text-center">Coupon Details</h2>
                    {couponDetails ? (
                        <div className="space-y-4">
                            <p><strong>Code:</strong> {couponDetails.code}</p>
                            <p><strong>Discount Type:</strong> {couponDetails.discount_type}</p>
                            <p><strong>Discount Value:</strong> {couponDetails.discount_value}</p>
                            <p><strong>Max Uses:</strong> {couponDetails.max_uses == null ? 'Unlimited' : couponDetails.max_uses}</p>
                            <p><strong>Uses:</strong> {couponDetails.uses}</p>
                            <p><strong>Start Date:</strong> {new Date(couponDetails.start_date).toLocaleDateString()}</p>
                            <p><strong>End Date:</strong> {couponDetails.end_date ? new Date(couponDetails.end_date).toLocaleDateString() : 'No Expiry'}</p>
                            <p><strong>Status:</strong> {couponDetails.is_active == 1 ? 'Active' : 'Inactive'}</p>
                            <p><strong>Products: </strong>
                                {couponDetails.coupon_type == "1" ? (
                                    (JSON.parse(JSON.parse(couponDetails.product_ids))).map(item => (
                                        <span key={item} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                            {services[services.findIndex(service => service.value == item)]?.label || 'Unknown Service/Product'}
                                        </span>
                                    ))
                                ) : (
                                    <span>All Services</span>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                            <Loading />
                        </div>
                    )}
                    <div className="flex justify-center space-x-4 mt-4">
                        <button
                            type="button"
                            className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                            onClick={closeViewModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </section >
    );
}

export default Coupons;