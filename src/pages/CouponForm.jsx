import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import Toggle from 'react-toggle';
import { toast, Slide } from 'react-toastify';
import { API_Endpoint } from '../utilities/constants';
import { selectUser } from '../reducers/authSlice';
import { useSelector } from 'react-redux';

const CouponForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const coupon = location.state; // Access the passed state
    const user = useSelector(selectUser);
    const [couponCode, setCouponCode] = useState(coupon ? coupon.code : '');
    const [discountType, setDiscountType] = useState(coupon ? coupon.discount_type : 'fixed');
    const [discountValue, setDiscountValue] = useState(coupon ? coupon.discount_value : '');
    const [maxUses, setMaxUses] = useState(coupon ? coupon.max_uses : '');
    const [startDate, setStartDate] = useState(coupon ? coupon.start_date : new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(coupon ? coupon.end_date || '' : '');
    const [isActive, setIsActive] = useState(coupon ? coupon.is_active == '1' : true);
    const [orderType, setOrderType] = useState(coupon ? Number(coupon.coupon_type) : 0);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon && coupon.product_ids && services.length > 0) {
            // Parse and set selected services based on coupon data
            const parsedServices = JSON.parse(coupon.product_ids).map(id => 
                services.find(service => service.value === id)
            );
            setSelectedServices(parsedServices);
        }
    }, [coupon, services]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_Endpoint}services-list`);
            const servicesOptions = response.data
                .filter(service => service.service_type !== "subscription")
                .map(service => ({ value: service.id, label: service.name }));
            setServices(servicesOptions);
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

    const handleSave = async (event) => {
        event.preventDefault();
        setLoading(true);

        // Validation for coupon code (no spaces)
        if (/\s/.test(couponCode)) {
            toast.error('Coupon code should not contain any spaces.', {
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
            setLoading(false);
            return;
        }

        // Validation for end date (cannot be earlier than start date)
        if (endDate && new Date(endDate) < new Date(startDate)) {
            toast.error('End date cannot be earlier than start date.', {
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
            setLoading(false);
            return;
        }

        const productIds = selectedServices.map(service => service.value);

        if (orderType === 1 && productIds.length === 0) {
            toast.error('Please select at least one service for Specific Service order type.', {
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
            setLoading(false);
            return;
        }

        try {
            if (coupon) {
                // Update coupon
                await axios({
                    method: "put",
                    url: `${API_Endpoint}admin/coupons/${coupon.id}`,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                    data: {
                        code: couponCode,
                        discount_type: discountType,
                        discount_value: discountValue,
                        max_uses: maxUses,
                        start_date: startDate,
                        end_date: endDate || null, // Send null if end date is not provided
                        is_active: isActive ? 1 : 0,
                        product_ids: productIds.length > 0 ? productIds : null,
                        coupon_type: orderType,
                    }
                });
                toast.success('Coupon updated successfully', {
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
            } else {
                // Add new coupon
                await axios({
                    method: "post",
                    url: `${API_Endpoint}admin/coupons`,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                    data: {
                        code: couponCode,
                        discount_type: discountType,
                        discount_value: discountValue,
                        max_uses: maxUses,
                        start_date: startDate,
                        end_date: endDate || null, // Send null if end date is not provided
                        is_active: isActive ? 1 : 0,
                        product_ids: productIds.length > 0 ? productIds : null,
                        coupon_type: orderType,
                    }
                });
                toast.success('Coupon added successfully', {
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
            navigate('/coupons'); // Navigate back to the coupons list
        } catch (error) {
            console.error(`Error ${coupon ? 'updating' : 'adding'} coupon`, error);
            toast.error(error.response.data.error, {
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

    const handleCancel = () => {
        navigate('/coupons'); // Navigate back to the coupons list
    };

    return (
        <section className="px-4 sm:px-5 py-8 sm:py-10">
            <div className="mb-8 sm:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 sm:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold text-xl sm:text-3xl font-semibold leading-7 sm:leading-9">
                    {coupon ? 'Update Coupon' : 'Add Coupon'}
                </h1>
            </div>

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-6 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="couponCode">Coupon Code</label>
                        <input
                            type="text"
                            name="couponCode"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="discountType">Discount Type</label>
                        <select
                            name="discountType"
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="fixed">Fixed</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="discountValue">Discount Value</label>
                        <input
                            type="number"
                            name="discountValue"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="maxUses">Max Uses</label>
                        <input
                            type="number"
                            name="maxUses"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </div>

                <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
                    <Toggle
                        checked={isActive}
                        onChange={() => setIsActive(!isActive)}
                        icons={false}
                    />
                </div>

                <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Order Type</label>
                    <div className="flex space-x-4">
                        <label>
                            <input
                                type="radio"
                                value={0}
                                checked={orderType === 0}
                                onChange={() => setOrderType(0)}
                            />
                            {' '}
                            Complete Order
                        </label>
                        <label>
                            <input
                                type="radio"
                                value={1}
                                checked={orderType === 1}
                                onChange={() => setOrderType(1)}
                            />
                            {' '}
                            Specific Service
                        </label>
                    </div>
                </div>

                {orderType === 1 && (
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Services</label>
                        <Select
                            isMulti
                            options={services}
                            value={selectedServices}
                            onChange={setSelectedServices}
                            className="w-full"
                        />
                    </div>
                )}

                <div className="flex justify-between sm:justify-end space-x-4">
                    <button
                        type="button"
                        className="bg-red-500 text-sm sm:text-base font-semibold text-white px-3 sm:px-4 py-2 rounded"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="text-sm sm:text-[14px] bg-[#4BC500] text-white px-4 sm:px-5 py-2 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? (coupon ? 'Updating...' : 'Adding...') : (coupon ? 'Update Coupon' : 'Add Coupon')}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CouponForm;