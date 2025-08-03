import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import { IoEye, IoTrash, IoCreate, IoAdd, IoNewspaper, IoEyeOutline, IoSearch, IoFilter } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import SimpleTextEditor from '../components/SimpleTextEditor';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [blogDetailsModalOpen, setBlogDetailsModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [blogDetailsLoading, setBlogDetailsLoading] = useState(false);
    const [addBlogModalOpen, setAddBlogModalOpen] = useState(false);
    const [editBlogModalOpen, setEditBlogModalOpen] = useState(false);
    const [blogFormData, setBlogFormData] = useState({
        title: '',
        author_name: '',
        publish_date: '',
        read_time: '',
        keywords: '',
        content: '',
        category_id: '',
        is_active: true,
        html_content: '',
        image_url: '',
        image_file: null
    });
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState(null);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const abortController = useRef(null);

    useEffect(() => {
        fetchBlogs(currentPage, filter, searchQuery);
        fetchCategories();
    }, [currentPage, filter, searchQuery]);

    const fetchBlogs = async (page, filter, searchQuery) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/blogs?page=${page}&per_page=${Per_Page}`;
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
            
            // Handle different response structures
            const blogsData = response.data?.data?.blogs || response.data?.blogs || response.data?.data || [];
            setBlogs(Array.isArray(blogsData) ? blogsData : []);
            setCurrentPage(response.data?.data?.pagination?.current_page || response.data?.current_page || 1);
            setTotalPages(response.data?.data?.pagination?.total_pages || response.data?.last_page || 1);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching blogs", error);
                setBlogs([]); // Set empty array on error
                setLoading(false);
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/categories`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            const categoriesData = response.data.data || [];
            console.log('Fetched categories:', categoriesData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchBlogDetails = async (blogId) => {
        setBlogDetailsLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/blogs/${blogId}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setSelectedBlog(response.data.data || response.data);
            setBlogDetailsModalOpen(true);
        } catch (error) {
            console.error("Error fetching blog details", error);
            toast.error('Error fetching blog details', {
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
            setBlogDetailsLoading(false);
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

    const openConfirmationModal = (blog) => {
        setBlogToDelete(blog);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setConfirmationModalOpen(false);
        setBlogToDelete(null);
    };

    const handleDeleteBlog = async () => {
        if (!blogToDelete) return;

        setIsDeleting(true);
        const id = toast.loading('Deleting blog...', {
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
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/blogs/${blogToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Blog deleted successfully', {
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
            fetchBlogs(currentPage, filter, searchQuery);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            toast.error('Error deleting blog', {
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
            console.error('Error deleting blog:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openBlogDetailsModal = (blog) => {
        fetchBlogDetails(blog.id);
    };

    const closeBlogDetailsModal = () => {
        setBlogDetailsModalOpen(false);
        setSelectedBlog(null);
    };

    const openAddBlogModal = () => {
        setBlogFormData({
            title: '',
            author_name: '',
            publish_date: '',
            read_time: '',
            keywords: '',
            content: '',
            category_id: '',
            is_active: true,
            html_content: '',
            image_url: '',
            image_file: null
        });
        setEditingBlogId(null);
        setAddBlogModalOpen(true);
    };

    const closeAddBlogModal = () => {
        setAddBlogModalOpen(false);
        setBlogFormData({
            title: '',
            author_name: '',
            publish_date: '',
            read_time: '',
            keywords: '',
            content: '',
            category_id: '',
            is_active: true,
            html_content: '',
            image_url: '',
            image_file: null
        });
        setEditingBlogId(null);
    };

    const openEditBlogModal = (blog) => {
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            } catch (error) {
                console.error('Error formatting date:', error);
                return '';
            }
        };

        console.log('Blog data for editing:', blog); // Debug log

        setBlogFormData({
            title: blog.title || '',
            author_name: blog.author_name || '',
            publish_date: formatDateForInput(blog.publish_date),
            read_time: blog.read_time || '',
            keywords: blog.keywords || '',
            content: blog.content || '',
            category_id: String(blog.category_id || blog.category?.id || ''),
            is_active: blog.is_published == '1' || blog.is_published === 1,
            html_content: blog.html_content || '',
            image_url: blog.image_url || '',
            image_file: null
        });
        setEditingBlogId(blog.id);
        setEditBlogModalOpen(true);
    };

    const closeEditBlogModal = () => {
        setEditBlogModalOpen(false);
        setBlogFormData({
            title: '',
            author_name: '',
            publish_date: '',
            read_time: '',
            keywords: '',
            content: '',
            category_id: '',
            is_active: true,
            html_content: '',
            image_url: '',
            image_file: null
        });
        setEditingBlogId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBlogFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (content) => {
        setBlogFormData(prev => ({
            ...prev,
            content: content
        }));
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBlogFormData(prev => ({
                ...prev,
                image_file: file,
                image_url: '' // Clear URL when file is selected
            }));
        }
    };

    const handleImageUrlChange = (e) => {
        const { value } = e.target;
        setBlogFormData(prev => ({
            ...prev,
            image_url: value,
            image_file: null // Clear file when URL is entered
        }));
    };

    const clearImageInput = () => {
        setBlogFormData(prev => ({
            ...prev,
            image_url: '',
            image_file: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Form validation
        if (!blogFormData.title.trim()) {
            toast.error('Title is required', {
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
            setIsSubmitting(false);
            return;
        }

        if (!blogFormData.author_name.trim()) {
            toast.error('Author name is required', {
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
            setIsSubmitting(false);
            return;
        }

        if (!blogFormData.publish_date) {
            toast.error('Publish date is required', {
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
            setIsSubmitting(false);
            return;
        }

        if (!blogFormData.category_id) {
            toast.error('Category is required', {
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
            setIsSubmitting(false);
            return;
        }

        const id = toast.loading(editBlogModalOpen ? 'Updating blog...' : 'Creating blog...', {
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
            const formData = new FormData();
            formData.append('title', blogFormData.title.trim());
            formData.append('author_name', blogFormData.author_name.trim());
            formData.append('publish_date', blogFormData.publish_date);
            formData.append('read_time', blogFormData.read_time || '5');
            formData.append('keywords', blogFormData.keywords || '');
            formData.append('content', blogFormData.content || '');
            formData.append('category_id', blogFormData.category_id);
            formData.append('is_published', blogFormData.is_active ? 1 : 0);
            formData.append('html_content', blogFormData.html_content || '');

            if (blogFormData.image_file) {
                formData.append('image', blogFormData.image_file);
            } else if (blogFormData.image_url) {
                formData.append('image_url', blogFormData.image_url);
            }

            const url = editBlogModalOpen 
                ? `${API_Endpoint}admin/blogs/${editingBlogId}`
                : `${API_Endpoint}admin/blogs`;
            
            const method = editBlogModalOpen ? 'put' : 'post';
            
            console.log('Submitting blog data:', {
                url,
                method,
                editingBlogId,
                formData: Object.fromEntries(formData.entries())
            });
            
            const response = await axios({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });

            console.log('API Response:', response.data);

            toast.dismiss(id);
            toast.success(editBlogModalOpen ? 'Blog updated successfully' : 'Blog created successfully', {
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

            if (editBlogModalOpen) {
                closeEditBlogModal();
            } else {
                closeAddBlogModal();
            }
            fetchBlogs(currentPage, filter, searchQuery);
        } catch (error) {
            toast.dismiss(id);
            console.error('Error saving blog:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            const errorMessage = error.response?.data?.message || error.message || 'Error saving blog';
            toast.error(errorMessage, {
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
            setIsSubmitting(false);
        }
    };

    const handleToggleActivation = async (blogId, currentStatus) => {
        try {
            await axios({
                method: 'put',
                url: `${API_Endpoint}admin/blogs/${blogId}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    is_published: currentStatus == '1' || currentStatus === 1 ? 0 : 1
                }
            });
            
            toast.success('Blog status updated successfully', {
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
            
            fetchBlogs(currentPage, filter, searchQuery);
        } catch (error) {
            toast.error('Error updating blog status', {
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
            console.error('Error updating blog status:', error);
        }
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Blog Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage your platform blogs and articles</p>
                    </div>
                    <button
                        onClick={openAddBlogModal}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoAdd className="w-4 h-4" />
                        <span>Add Blog</span>
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
                                placeholder="Search blogs by title or author..."
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
                                All Blogs
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

            {/* Blogs Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                blogs.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            Blog
                                        </th>
                                        <th className="table-header-cell">
                                            Author
                                        </th>
                                        <th className="table-header-cell">
                                            Category
                                        </th>
                                        <th className="table-header-cell">
                                            Publish Date
                                        </th>
                                        <th className="table-header-cell">
                                            Read Time
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
                                    {blogs.map(blog => (
                                        <tr key={blog.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                                        <IoNewspaper className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium dark-text max-w-xs truncate" title={blog.title}>
                                                            {blog.title}
                                                        </div>
                                                        <div className="text-sm dark-text-muted">ID: {blog.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {blog.author_name}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {blog.category?.name || 'N/A'}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {new Date(blog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {blog.read_time}
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <Toggle
                                                    checked={blog.is_published == '1' || blog.is_published === 1}
                                                    onChange={() => handleToggleActivation(blog.id, blog.is_published)}
                                                    icons={false}
                                                    className="modern-toggle"
                                                    aria-label="Blog status"
                                                />
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openBlogDetailsModal(blog)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditBlogModal(blog)}
                                                        className="action-button action-button-view"
                                                        title="Edit Blog"
                                                    >
                                                        <IoCreate className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(blog)}
                                                        className="action-button action-button-delete"
                                                        title="Delete Blog"
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
                            <IoNewspaper className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No blogs found</h3>
                        <p className="empty-state-description">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && blogs.length > 0 && (
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

            {/* Add/Edit Blog Modal */}
            <Modal
                isOpen={addBlogModalOpen || editBlogModalOpen}
                onRequestClose={editBlogModalOpen ? closeEditBlogModal : closeAddBlogModal}
                contentLabel={editBlogModalOpen ? "Edit Blog" : "Add New Blog"}
                className="modern-modal"
            >
                <div className="max-w-4xl w-full">
                    <h2 className="text-2xl font-bold dark-text mb-6">{editBlogModalOpen ? "Edit Blog" : "Add New Blog"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={blogFormData.title}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Author Name *</label>
                                <input
                                    type="text"
                                    name="author_name"
                                    value={blogFormData.author_name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Publish Date *</label>
                                <input
                                    type="date"
                                    name="publish_date"
                                    value={blogFormData.publish_date}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Read Time (e.g., 5) *</label>
                                <input
                                    type="text"
                                    name="read_time"
                                    value={blogFormData.read_time}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Category *</label>
                                <select
                                    name="category_id"
                                    value={blogFormData.category_id}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {Array.isArray(categories) && categories.map(category => (
                                        <option key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Keywords (SEO)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={blogFormData.keywords}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>
                        </div>
                        
                        {/* Image Input Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold dark-text">Blog Image</h3>
                            
                            {/* Image URL Input */}
                            <div>
                                <label className="form-label">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={blogFormData.image_url}
                                        onChange={handleImageUrlChange}
                                        className="form-input flex-1"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearImageInput}
                                        className="btn-secondary"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            
                            {/* File Upload */}
                            <div>
                                <label className="form-label">Upload Image File</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="form-input flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                        className="btn-secondary"
                                    >
                                        Browse
                                    </button>
                                </div>
                                {blogFormData.image_file && (
                                    <div className="mt-2 p-2 bg-green-100 rounded-md">
                                        <p className="text-sm text-green-800">
                                            Selected file: {blogFormData.image_file.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Image Preview */}
                            {(blogFormData.image_url || blogFormData.image_file || (editBlogModalOpen && blogFormData.image_url)) && (
                                <div className="mt-4">
                                    <label className="form-label">Image Preview</label>
                                    <div className="border rounded-md p-4 bg-gray-50">
                                        {blogFormData.image_file ? (
                                            <img
                                                src={URL.createObjectURL(blogFormData.image_file)}
                                                alt="Preview"
                                                className="max-w-full h-auto max-h-48 object-contain"
                                            />
                                        ) : blogFormData.image_url ? (
                                            <img
                                                src={blogFormData.image_url}
                                                alt="Preview"
                                                className="max-w-full h-auto max-h-48 object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        {blogFormData.image_url && (
                                            <div className="hidden text-sm text-red-600 mt-2">
                                                Unable to load image from URL
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="form-label">Content</label>
                            <textarea
                                name="content"
                                value={blogFormData.content}
                                onChange={handleInputChange}
                                className="form-input"
                                rows="6"
                                placeholder="Enter your blog content here..."
                            />
                        </div>

                        <div>
                            <label className="form-label">HTML Content</label>
                            <textarea
                                name="html_content"
                                value={blogFormData.html_content}
                                onChange={handleInputChange}
                                className="form-input"
                                rows="6"
                                placeholder="Enter your HTML code here..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={editBlogModalOpen ? closeEditBlogModal : closeAddBlogModal}
                                className="btn-secondary"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary"
                            >
                                {isSubmitting ? 'Saving...' : (editBlogModalOpen ? 'Update Blog' : 'Add Blog')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteBlog}
                title="Delete Blog"
                message="Are you sure you want to delete this blog? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            {/* Blog Details Modal */}
            <Modal
                isOpen={blogDetailsModalOpen}
                onRequestClose={closeBlogDetailsModal}
                contentLabel="Blog Details"
                className="modern-modal"
            >
                {blogDetailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading />
                    </div>
                ) : (
                    selectedBlog && (
                        <div>
                            <h2 className="text-2xl font-bold dark-text mb-6">Blog Details</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label">Title</label>
                                        <p className="dark-text">{selectedBlog.title}</p>
                                    </div>
                                    <div>
                                        <label className="form-label">Author</label>
                                        <p className="dark-text">{selectedBlog.author_name}</p>
                                    </div>
                                    <div>
                                        <label className="form-label">Publish Date</label>
                                        <p className="dark-text">
                                            {new Date(selectedBlog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="form-label">Read Time</label>
                                        <p className="dark-text">{selectedBlog.read_time}</p>
                                    </div>
                                    <div>
                                        <label className="form-label">Keywords</label>
                                        <p className="dark-text">{selectedBlog.keywords}</p>
                                    </div>
                                    <div>
                                        <label className="form-label">Category</label>
                                        <p className="dark-text">{selectedBlog.category?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="form-label">Status</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            selectedBlog.is_published == '1' || selectedBlog.is_published === 1
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                            {selectedBlog.is_published == '1' || selectedBlog.is_published === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Content</label>
                                    <div className="max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                                        {selectedBlog.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                                        ) : (
                                            <p className="text-gray-500 italic">No content available</p>
                                        )}
                                    </div>
                                </div>
                                {selectedBlog.html_content && (
                                    <div>
                                        <label className="form-label">HTML Content</label>
                                        <div className="max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                                            <pre className="text-xs whitespace-pre-wrap">{selectedBlog.html_content}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center mt-6">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeBlogDetailsModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
};

export default Blog; 