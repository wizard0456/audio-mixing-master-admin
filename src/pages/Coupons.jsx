import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Select from 'react-select';
import { toast } from 'react-toastify';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discountType, setDiscountType] = useState('fixed');
    const [discountValue, setDiscountValue] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [adding, setAdding] = useState(false);
    const [filter, setFilter] = useState('all');
    const user = useSelector(selectUser);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const abortController = useRef(null);
    const [couponDetails, setCouponDetails] = useState(null);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);

    useEffect(() => {
        fetchCoupons(currentPage, filter);
        fetchServices();
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
                console.log('Request canceled', error.message);
            } else {
                console.error("Error fetching coupons", error);
                setLoading(false);
                toast.error('Error fetching coupons');
            }
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get('https://music.zetdigi.com/backend/public/api/services-list');
            const servicesOptions = response.data.filter(service => service.service_type !== "subscription").map(service => ({
                value: service.id,
                label: service.name
            }));
            console.log('Services:', servicesOptions);
            setServices(servicesOptions);
        } catch (error) {
            console.error('Error fetching services', error);
            toast.error('Error fetching services');
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

    const openModal = (coupon = null) => {
        if (coupon) {
            console.log('Editing coupon:', coupon);

            setCouponCode(coupon.code);
            setDiscountType(coupon.discount_type);
            setDiscountValue(coupon.discount_value);
            setMaxUses(coupon.max_uses);
            setStartDate(coupon.start_date);
            setEndDate(coupon.end_date);
            setIsActive(coupon.is_active === "1");
            setEditingCoupon(coupon);
            setSelectedServices(JSON.parse(coupon.product_ids).map(id => services.find(service => service.value === id)));
        } else {
            setCouponCode('');
            setDiscountType('fixed');
            setDiscountValue('');
            setMaxUses('');
            setStartDate('');
            setEndDate('');
            setIsActive(true);
            setEditingCoupon(null);
            setSelectedServices([]);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setCouponCode('');
        setDiscountType('fixed');
        setDiscountValue('');
        setMaxUses('');
        setStartDate('');
        setEndDate('');
        setIsActive(true);
        setEditingCoupon(null);
        setSelectedServices([]);
    };

    const handleAddOrUpdateCoupon = async (event) => {
        event.preventDefault();
        setAdding(true);
        const productIds = selectedServices.map(service => service.value);
        try {
            if (editingCoupon) {
                // Update coupon
                await axios({
                    method: "put",
                    url: `${API_Endpoint}admin/coupons/${editingCoupon.id}`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: {
                        code: couponCode,
                        discount_type: discountType,
                        discount_value: discountValue,
                        max_uses: maxUses,
                        start_date: startDate,
                        end_date: endDate,
                        is_active: isActive ? 1 : 0,
                        product_ids: productIds
                    }
                });
                toast.success('Coupon updated successfully');
            } else {
                // Add new coupon
                await axios({
                    method: "post",
                    url: `${API_Endpoint}admin/coupons`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: {
                        code: couponCode,
                        discount_type: discountType,
                        discount_value: discountValue,
                        max_uses: maxUses,
                        start_date: startDate,
                        end_date: endDate,
                        is_active: isActive ? 1 : 0,
                        product_ids: productIds
                    }
                });
                toast.success('Coupon added successfully');
            }
            closeModal();
            fetchCoupons(currentPage, filter); // Reload fetching
        } catch (error) {
            console.error(`Error ${editingCoupon ? 'updating' : 'adding'} coupon`, error);
            toast.error(`Error ${editingCoupon ? 'updating' : 'adding'} coupon`);
        } finally {
            setAdding(false);
        }
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

            console.log('Response:', response.data);


            setCouponDetails(response.data);
        } catch (error) {
            console.error('Error fetching coupon details', error);
            toast.error('Error fetching coupon details');
        }
    };

    const closeViewModal = () => {
        setViewModalIsOpen(false);
        setCouponDetails(null);
    };

    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Coupons</h1>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Coupons
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Coupons
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Coupons
                    </button>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                >
                    Add Coupon
                </button>
            </div>

            

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    Loading...
                </div>
            ) : (
                coupons?.length !== 0 ? (
                    <table className='w-full border-0'>
                        <thead>
                            <tr>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Code</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Discount Type</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Discount Value</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Max Uses</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Uses</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Start Date</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">End Date</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Status</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-base leading-6 pb-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons?.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{coupon.code}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.discount_type}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.discount_value}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.max_uses}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.uses}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(coupon.start_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(coupon.end_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{coupon.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                            <button onClick={() => fetchCouponDetails(coupon.id)}><FaEye color="#969696" /></button>
                                            <button onClick={() => openModal(coupon)}><TiPencil color="#969696" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No coupons found
                    </div>
                )
            )}

            {loading || (
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
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Coupon"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">{editingCoupon ? 'Update Coupon' : 'Add Coupon'}</h2>
                    <form onSubmit={handleAddOrUpdateCoupon} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="couponCode">Coupon Code</label>
                            <input
                                type="text"
                                name="couponCode"
                                className="w-full px-3 py-2 border rounded-md"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="discountType">Discount Type</label>
                            <select
                                name="discountType"
                                className="w-full px-3 py-2 border rounded-md"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                required
                            >
                                <option value="fixed">Fixed</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="discountValue">Discount Value</label>
                            <input
                                type="number"
                                name="discountValue"
                                className="w-full px-3 py-2 border rounded-md"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="services">Services</label>
                            <Select
                                isMulti
                                options={services}
                                value={selectedServices}
                                onChange={setSelectedServices}
                                className="w-full"
                                classNamePrefix="select"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maxUses">Max Uses</label>
                            <input
                                type="number"
                                name="maxUses"
                                className="w-full px-3 py-2 border rounded-md"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="w-full px-3 py-2 border rounded-md"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="w-full px-3 py-2 border rounded-md"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <p><strong>Status:</strong></p>
                            <Toggle
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                                icons={false}
                                aria-label="Coupon status"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeModal}
                                disabled={adding}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                                disabled={adding}
                            >
                                {adding ? (editingCoupon ? 'Updating...' : 'Adding...') : (editingCoupon ? 'Update Coupon' : 'Add Coupon')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                isOpen={viewModalIsOpen}
                onRequestClose={closeViewModal}
                contentLabel="View Coupon Details"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Coupon Details</h2>
                    {couponDetails ? (
                        <div className="space-y-4">
                            <p><strong>Code:</strong> {couponDetails.code}</p>
                            <p><strong>Discount Type:</strong> {couponDetails.discount_type}</p>
                            <p><strong>Discount Value:</strong> {couponDetails.discount_value}</p>
                            <p><strong>Max Uses:</strong> {couponDetails.max_uses}</p>
                            <p><strong>Uses:</strong> {couponDetails.uses}</p>
                            <p><strong>Start Date:</strong> {new Date(couponDetails.start_date).toLocaleDateString()}</p>
                            <p><strong>End Date:</strong> {new Date(couponDetails.end_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {couponDetails.is_active == 1 ? 'Active' : 'Inactive'}</p>
                            <p><strong>Products:</strong> {(JSON.parse(couponDetails.product_ids).map(item => <span key={item} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{services[services.findIndex(service => service.value == item)].label}</span>))}</p>
                        </div>
                    ) : (
                        <div>Loading...</div>
                    )}
                    <div className="flex justify-end space-x-4 mt-4">
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
        </section>
    );
}

export default Coupons;