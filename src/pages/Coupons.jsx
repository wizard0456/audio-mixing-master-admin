import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaPlus } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { IoEye, IoAdd, IoCreate, IoGift, IoPricetag, IoSearch, IoFilter } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logout } from '../reducers/authSlice';
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
    const dispatch = useDispatch();
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
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
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
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/coupons/${couponId}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            // Handle both possible response structures
            const couponData = response.data.data || response.data;
            setCouponDetails(couponData);
            setViewModalIsOpen(true);
        } catch (error) {
            console.error("Error fetching coupon details", error);
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
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Coupon Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage discount coupons and promotions</p>
                    </div>
                    <button
                        onClick={openAddCouponPage}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoAdd className="w-4 h-4" />
                        <span>Add Coupon</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search coupons by code..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="modern-input search-input"
                            />
                        </div>

                        {/* Filters */}
                        <div className="filters-container">
                            <IoFilter className="dark-text-muted w-4 h-4" />
                            <button
                                className={`filter-button ${
                                    filter === 'all' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Coupons
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'active' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'inactive' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive
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
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Code
                                        </th>
                                        <th className="table-header-cell">
                                            Discount Type
                                        </th>
                                        <th className="table-header-cell">
                                            Discount Value
                                        </th>
                                        <th className="table-header-cell">
                                            Max Uses
                                        </th>
                                        <th className="table-header-cell">
                                            Uses
                                        </th>
                                        <th className="table-header-cell">
                                            Start Date
                                        </th>
                                        <th className="table-header-cell">
                                            End Date
                                        </th>
                                        <th className="table-header-cell">
                                            Status
                                        </th>
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {coupons?.map(coupon => (
                                        <tr key={coupon.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                                        <IoPricetag className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium dark-text">{coupon.code}</div>
                                                        <div className="text-sm dark-text-muted">ID: {coupon.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {coupon.discount_type}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {coupon.discount_value}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {coupon.max_uses == null ? 'Unlimited' : coupon.max_uses}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {coupon.uses}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {formatDate(coupon.start_date)}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {coupon.end_date ? formatDate(coupon.end_date) : 'No Expiry'}
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    coupon.is_active == 1 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    {coupon.is_active == 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => fetchCouponDetails(coupon.id)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <Link 
                                                        to={"/update-coupons"} 
                                                        state={coupon}
                                                        className="action-button action-button-view"
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
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IoGift className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No coupons found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
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
                    <h2 className="text-2xl font-bold dark-text mb-6 text-center">Coupon Details</h2>
                    {couponDetails ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Code:</label>
                                    <p className="dark-text font-medium">{couponDetails.code}</p>
                                </div>
                                <div>
                                    <label className="form-label">Discount Type:</label>
                                    <p className="dark-text">{couponDetails.discount_type}</p>
                                </div>
                                <div>
                                    <label className="form-label">Discount Value:</label>
                                    <p className="dark-text font-medium">{couponDetails.discount_value}</p>
                                </div>
                                <div>
                                    <label className="form-label">Max Uses:</label>
                                    <p className="dark-text">{couponDetails.max_uses == null ? 'Unlimited' : couponDetails.max_uses}</p>
                                </div>
                                <div>
                                    <label className="form-label">Current Uses:</label>
                                    <p className="dark-text">{couponDetails.uses}</p>
                                </div>
                                <div>
                                    <label className="form-label">Status:</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        couponDetails.is_active == 1 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        {couponDetails.is_active == 1 ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div>
                                    <label className="form-label">Start Date:</label>
                                    <p className="dark-text">{formatDate(couponDetails.start_date)}</p>
                                </div>
                                <div>
                                    <label className="form-label">End Date:</label>
                                    <p className="dark-text">{couponDetails.end_date ? formatDate(couponDetails.end_date) : 'No Expiry'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Products:</label>
                                <div className="mt-2">
                                    {couponDetails.coupon_type == "1" ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(JSON.parse(couponDetails.product_ids)).map(item => (
                                                <span key={item} className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold">
                                                    {services[services.findIndex(service => service.value == item)]?.label || 'Unknown Service/Product'}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm dark-text-muted">All Services</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-8">
                            <Loading />
                        </div>
                    )}
                    <div className="flex justify-center mt-6">
                        <button
                            type="button"
                            className="btn-secondary"
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