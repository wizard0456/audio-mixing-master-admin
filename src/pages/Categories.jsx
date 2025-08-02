import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaTrashAlt, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { IoTrash, IoAdd, IoCreate, IoGrid, IoApps, IoSearch, IoFilter } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import Loading from '../components/Loading';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [adding, setAdding] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const user = useSelector(selectUser);
    const [isDeleting, setIsDeleting] = useState(false);
    const abortController = useRef(null);

    useEffect(() => {
        fetchCategories(currentPage, filter);
    }, [currentPage, filter]);

    const fetchCategories = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/categories?page=${page}&per_page=${Per_Page}`;
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

            setCategories(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching categories", error);
                setLoading(false);
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

    const getFilteredCategories = () => {
        if (!searchQuery) return categories;
        
        return categories.filter(category => 
            category.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const openModal = (category = null) => {
        if (category) {
            setCategoryName(category.name);
            setIsActive(category.is_active == "1");
            setEditingCategory(category);
        } else {
            setCategoryName('');
            setIsActive(true);
            setEditingCategory(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setCategoryName('');
        setIsActive(true);
        setEditingCategory(null);
    };

    const handleAddOrUpdateCategory = async (event) => {
        event.preventDefault();
        setAdding(true);

        const id = toast.loading(editingCategory ? 'Updating category...' : 'Adding category...', {
            position: "top-right",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
            transition: Slide,
        });

        try {
            const url = editingCategory 
                ? `${API_Endpoint}admin/categories/${editingCategory.id}` 
                : `${API_Endpoint}admin/categories`;
            
            const method = editingCategory ? 'PUT' : 'POST';
            
            await axios({
                method: method,
                url: url,
                data: {
                    name: categoryName,
                    is_active: isActive ? 1 : 0
                },
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            toast.dismiss(id);
            toast.success(editingCategory ? 'Category updated successfully!' : 'Category added successfully!', {
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

            closeModal();
            fetchCategories(currentPage, filter);
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error saving category.', {
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
            console.error('Error saving category:', error);
        } finally {
            setAdding(false);
        }
    };

    const openConfirmationModal = (category) => {
        setCategoryToDelete(category);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setCategoryToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        const id = toast.loading('Deleting category...', {
            position: "top-right",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
            transition: Slide,
        });

        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/categories/${categoryToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Category deleted successfully', {
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
            fetchCategories(currentPage, filter);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error deleting category', {
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
            console.error('Error deleting category:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredCategories = getFilteredCategories();

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Category Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage and configure all platform categories and classifications</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoAdd className="w-4 h-4" />
                        <span>Add Category</span>
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
                                placeholder="Search categories by name..."
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
                                All Categories
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

            {/* Categories Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                filteredCategories.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Name
                                        </th>
                                        <th className="table-header-cell">
                                            Created At
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
                                    {filteredCategories.map(category => (
                                        <tr key={category.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {category.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">{category.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {new Date(category.createdAt).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="text-sm dark-text">
                                                    {category.is_active == 1 ? 'Active' : 'Inactive'}
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => openModal(category)}
                                                        className="action-button action-button-edit"
                                                        title="Edit Category"
                                                    >
                                                        <IoCreate className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(category)}
                                                        className="action-button action-button-delete"
                                                        title="Delete Category"
                                                    >
                                                        <IoTrash className="w-4 h-4" />
                                                    </button>
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
                            <IoApps className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No categories found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && filteredCategories.length > 0 && !searchQuery && (
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
                        Showing {filteredCategories.length} of {categories.length} categories matching "{searchQuery}"
                    </p>
                </div>
            )}

            {/* Add/Edit Category Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Category"
                className="modern-modal"
            >
                <div>
                    <h2 className="text-xl md:text-2xl mb-4 font-semibold dark-text">{editingCategory ? 'Update Category' : 'Add Category'}</h2>
                    <form onSubmit={handleAddOrUpdateCategory} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="category">Category Name</label>
                            <input
                                type="text"
                                name="category"
                                className="modern-input w-full"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <p className="dark-text"><strong>Status:</strong></p>
                            <Toggle
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                                icons={false}
                                aria-label="Category status"
                                className="modern-toggle"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={closeModal}
                                disabled={adding}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={adding}
                            >
                                {adding ? (editingCategory ? 'Updating...' : 'Adding...') : (editingCategory ? 'Update Category' : 'Add Category')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

export default Categories;