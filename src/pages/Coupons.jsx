import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaPlus } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { IoEye, IoAdd, IoCreate, IoGift, IoPricetag } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import { formatDate } from '../utilities/dateUtils';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [couponDetails, setCouponDetails] = useState(null);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
    const [services, setServices] = useState([]);
    const user = useSelector(selectUser);
    const abortController = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons(currentPage, filter, searchQuery);
    }, [currentPage, filter, searchQuery]);

    const fetchCoupons = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/coupons?page=${page}&per_page=${Per_Page}`;
        if (filter !== 'all') {
            url += `&is_active=${filter}`;
        }
        if (searchQuery) {
            url += `&search=${searchQuery}`;
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
            console.log(response.data.data);
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

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
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

    const getStatusBadge = (status) => {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {status === 'active' ? 'Active' : 'Inactive'}
            </span>
        );
    };

    // Table headers configuration
    const tableHeaders = [
        {
            key: 'code',
            label: 'Coupon',
            subtitle: 'Coupon Details',
                            icon: <IoEye className="w-5 h-5 text-white" />,
            render: (value, row) => (
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <IoEye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{row.code}</p>
                        <p className="text-sm text-gray-500">ID: {row.id}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'discount',
            label: 'Discount',
            subtitle: 'Discount Value',
            render: (value, row) => (
                <p className="text-gray-900 font-medium">{row.discount}%</p>
            )
        },
        {
            key: 'valid_from',
            label: 'Valid From',
            subtitle: 'Start Date',
            isDate: true
        },
        {
            key: 'valid_until',
            label: 'Valid Until',
            subtitle: 'End Date',
            isDate: true
        },
        {
            key: 'status',
            label: 'Status',
            subtitle: 'Coupon Status',
            render: (value, row) => getStatusBadge(row.status)
        }
    ];

    // Table actions
    const tableActions = [
        {
                            icon: <IoEye className="w-4 h-4" />,
            onClick: fetchCouponDetails,
            className: "text-blue-600 hover:bg-blue-50",
            title: "View Details"
        },
        {
                            icon: <IoCreate className="w-4 h-4" />,
            onClick: () => navigate(`/update-coupons?id=${couponDetails?.id}`),
            className: "text-green-600 hover:bg-green-50",
            title: "Edit Coupon"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupon Management</h1>
                        <p className="text-gray-600">Manage discount coupons and promotions</p>
                    </div>
                    <button
                        onClick={openAddCouponPage}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoAdd className="w-4 h-4 mr-1" />
                        <span>Add Coupon</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search coupons by code..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="modern-input w-full"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-2">
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'all' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Coupons
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'active' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active Coupons
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'inactive' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive Coupons
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                coupons?.length !== 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Discount Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Discount Value
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Max Uses
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uses
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            End Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {coupons?.map(coupon => (
                                        <tr key={coupon.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.discount_type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.discount_value}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.max_uses == null ? 'Unlimited' : coupon.max_uses}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.uses}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(coupon.start_date)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.end_date ? formatDate(coupon.end_date) : 'No Expiry'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{coupon.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => fetchCouponDetails(coupon.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <Link 
                                                        to={"/update-coupons"} 
                                                        state={coupon}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Edit Coupon"
                                                    >
                                                        <IoCreate className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IoGift className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No coupons found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && coupons?.length > 0 && (
                <div className="mt-6">
                    <ReactPaginate
                        previousLabel={<FaAngleDoubleLeft />}
                        nextLabel={<FaAngleDoubleRight />}
                        pageCount={totalPages}
                        onPageChange={handlePageClick}
                        containerClassName="pagination"
                        pageClassName=""
                        pageLinkClassName=""
                        previousClassName=""
                        previousLinkClassName=""
                        nextClassName=""
                        nextLinkClassName=""
                        activeClassName="active"
                        disabledClassName="disabled"
                    />
                </div>
            )}

            {/* View Coupon Details Modal */}
            <Modal
                isOpen={viewModalIsOpen}
                onRequestClose={closeViewModal}
                contentLabel="View Coupon Details"
                className="modern-modal"
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
                            <p><strong>Start Date:</strong> {formatDate(couponDetails.start_date)}</p>
                            <p><strong>End Date:</strong> {couponDetails.end_date ? formatDate(couponDetails.end_date) : 'No Expiry'}</p>
                            <p><strong>Status:</strong> {couponDetails.is_active == 1 ? 'Active' : 'Inactive'}</p>
                            <p><strong>Products: </strong>
                                {couponDetails.coupon_type == "1" ? (
                                    (JSON.parse(couponDetails.product_ids)).map(item => (
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
                        <div className="flex justify-center items-center py-8">
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
        </div>
    );
};

export default Coupons;