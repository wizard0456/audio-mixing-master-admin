import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import Toggle from 'react-toggle';
import { toast, Slide } from 'react-toastify';
import { API_Endpoint } from '../utilities/constants';
import { selectUser } from '../reducers/authSlice';
import { useSelector } from 'react-redux';
import { IoArrowBack, IoPricetag } from 'react-icons/io5';

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

        const id = toast.loading(coupon ? 'Updating coupon...' : 'Creating coupon...', {
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

        try {
            if (coupon) {
                // Update coupon
                await axios({
                    method: "put",
                    url: `${API_Endpoint}admin/coupons/${coupon.id}`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: {
                        code: couponCode,
                        discount_type: discountType,
                        discount_value: discountValue,
                        max_uses: maxUses || null,
                        start_date: startDate,
                        end_date: endDate || null,
                        is_active: isActive ? 1 : 0,
                        coupon_type: orderType,
                        product_ids: orderType === 1 ? JSON.stringify(productIds) : null
                    }
                });
            } else {
                // Create new coupon
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
                        max_uses: maxUses || null,
                        start_date: startDate,
                        end_date: endDate || null,
                        is_active: isActive ? 1 : 0,
                        coupon_type: orderType,
                        product_ids: orderType === 1 ? JSON.stringify(productIds) : null
                    }
                });
            }

            toast.dismiss(id);
            toast.success(coupon ? 'Coupon updated successfully!' : 'Coupon created successfully!', {
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

            navigate('/coupons');
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error saving coupon', {
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
            console.error('Error saving coupon:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/coupons');
    };

    useEffect(() => {
        // Fetch services for the dropdown
        const fetchServices = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: `${API_Endpoint}admin/services`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    }
                });
                const servicesData = response.data.data.map(service => ({
                    value: service.id,
                    label: service.name
                }));
                setServices(servicesData);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, [user.token]);

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleCancel}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <IoArrowBack className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <div>
                            <h1 className="page-title dark-text">
                                {coupon ? 'Edit Coupon' : 'Add New Coupon'}
                            </h1>
                            <p className="page-subtitle dark-text-secondary">
                                {coupon ? 'Update coupon details and settings' : 'Create a new discount coupon'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="dark-card p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label" htmlFor="couponCode">
                                Coupon Code *
                            </label>
                            <input
                                type="text"
                                id="couponCode"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="form-input"
                                placeholder="Enter coupon code"
                                required
                            />
                            <p className="text-xs dark-text-muted mt-1">No spaces allowed</p>
                        </div>

                        <div>
                            <label className="form-label" htmlFor="discountType">
                                Discount Type *
                            </label>
                            <select
                                id="discountType"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" htmlFor="discountValue">
                                Discount Value *
                            </label>
                            <input
                                type="number"
                                id="discountValue"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                className="form-input"
                                placeholder={discountType === 'fixed' ? 'Enter amount' : 'Enter percentage'}
                                min="0"
                                step={discountType === 'percentage' ? '0.01' : '1'}
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="maxUses">
                                Maximum Uses
                            </label>
                            <input
                                type="number"
                                id="maxUses"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                className="form-input"
                                placeholder="Leave empty for unlimited"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="startDate">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="endDate">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="form-input"
                                min={startDate}
                            />
                        </div>
                    </div>

                    {/* Order Type */}
                    <div>
                        <label className="form-label">Order Type *</label>
                        <div className="flex space-x-4 mt-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    value="0"
                                    checked={orderType === 0}
                                    onChange={(e) => setOrderType(Number(e.target.value))}
                                    className="form-radio"
                                />
                                <span className="dark-text">All Services</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    value="1"
                                    checked={orderType === 1}
                                    onChange={(e) => setOrderType(Number(e.target.value))}
                                    className="form-radio"
                                />
                                <span className="dark-text">Specific Services</span>
                            </label>
                        </div>
                    </div>

                    {/* Services Selection */}
                    {orderType === 1 && (
                        <div>
                            <label className="form-label">Select Services *</label>
                            <Select
                                isMulti
                                value={selectedServices}
                                onChange={setSelectedServices}
                                options={services}
                                className="mt-2"
                                classNamePrefix="select"
                                placeholder="Select services..."
                                isSearchable
                            />
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center space-x-3">
                        <label className="form-label mb-0">Status:</label>
                        <Toggle
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            icons={false}
                            className="modern-toggle"
                            aria-label="Coupon status"
                        />
                        <span className="text-sm dark-text-muted">
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex items-center space-x-2"
                            disabled={loading}
                        >
                            <IoPricetag className="w-4 h-4" />
                            <span>{loading ? (coupon ? 'Updating...' : 'Creating...') : (coupon ? 'Update Coupon' : 'Create Coupon')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponForm;