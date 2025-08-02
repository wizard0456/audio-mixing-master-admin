import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { IoEye, IoAdd, IoCreate, IoGift, IoPricetag, IoSearch, IoFilter } from 'react-icons/io5';
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
        fetchCoupons(currentPage, filter);
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
    };

    const getFilteredCoupons = () => {
        if (!searchQuery) return coupons;
        
        return coupons.filter(coupon => 
            coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const openAddCouponPage = () => {
        navigate('/add-coupon');
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
            setCouponDetails(response.data);
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
        switch (status) {
            case 'active':
                return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span>;
            case 'inactive':
                return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">Inactive</span>;
            case 'expired':
                return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Expired</span>;
            default:
                return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">Unknown</span>;
        }
    };

    const filteredCoupons = getFilteredCoupons();

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Coupon Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage and configure all platform coupons and discounts</p>
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
                                placeholder="Search coupons by code or description..."
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
                filteredCoupons.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Code
                                        </th>
                                        <th className="table-header-cell">
                                            Description
                                        </th>
                                        <th className="table-header-cell">
                                            Discount
                                        </th>
                                        <th className="table-header-cell">
                                            Valid From
                                        </th>
                                        <th className="table-header-cell">
                                            Valid Until
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
                                    {filteredCoupons.map(coupon => (
                                        <tr key={coupon.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {coupon.code.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">{coupon.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {coupon.description || '-'}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {formatDate(coupon.valid_from)}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {formatDate(coupon.valid_until)}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm">
                                                    {getStatusBadge(coupon.status)}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => fetchCouponDetails(coupon.id)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        to={`/edit-coupon/${coupon.id}`}
                                                        className="action-button action-button-edit"
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
            {!loading && filteredCoupons.length > 0 && !searchQuery && (
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

            {/* Filtering message */}
            {searchQuery && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredCoupons.length} of {coupons.length} coupons matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* View Coupon Details Modal */}
            <Modal
                isOpen={viewModalIsOpen}
                onRequestClose={closeViewModal}
                contentLabel="Coupon Details"
                className="modern-modal"
            >
                {couponDetails && (
                    <div>
                        <h2 className="text-xl md:text-2xl mb-4 font-semibold dark-text">Coupon Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Code:</strong> {couponDetails.code}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Status:</strong> {getStatusBadge(couponDetails.status)}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Discount Type:</strong> {couponDetails.discount_type}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Discount Value:</strong> {couponDetails.discount_type === 'percentage' ? `${couponDetails.discount_value}%` : `$${couponDetails.discount_value}`}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Valid From:</strong> {formatDate(couponDetails.valid_from)}</p>
                                </div>
                                <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                    <p className="dark-text"><strong className='font-semibold dark-text'>Valid Until:</strong> {formatDate(couponDetails.valid_until)}</p>
                                </div>
                            </div>
                            <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                <p className="dark-text"><strong className='font-semibold dark-text'>Description:</strong></p>
                                <p className="dark-text-muted mt-2">{couponDetails.description || 'No description available'}</p>
                            </div>
                            <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                <p className="dark-text"><strong className='font-semibold dark-text'>Usage Limit:</strong> {couponDetails.usage_limit || 'Unlimited'}</p>
                            </div>
                            <div className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                <p className="dark-text"><strong className='font-semibold dark-text'>Used Count:</strong> {couponDetails.used_count || 0}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={closeViewModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Coupons;