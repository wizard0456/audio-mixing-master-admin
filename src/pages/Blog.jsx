import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import { IoEye, IoTrash, IoCreate, IoAdd, IoNewspaper, IoEyeOutline } from 'react-icons/io5';
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
                method: 'get',
                url: `${API_Endpoint}admin/blog-categories`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const categoriesData = response.data?.data?.categories || response.data?.categories || response.data?.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBlogDetails = async (blogId) => {
        setBlogDetailsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: `${API_Endpoint}admin/blogs/${blogId}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            // Handle different response structures
            const blogData = response.data?.data?.blog || response.data?.blog || response.data;
            setSelectedBlog(blogData);
            setBlogDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching blog details:', error);
            setBlogDetailsLoading(false);
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
        setBlogToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteBlog = async () => {
        if (!blogToDelete) return;
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/blogs/${blogToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchBlogs(currentPage, filter); // Reload fetching
            closeConfirmationModal();
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
        } catch (error) {
            console.error('Error deleting blog:', error);
            setIsDeleting(false);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            } else {
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
            }
        }
    };

    const openBlogDetailsModal = (blog) => {
        fetchBlogDetails(blog.id);
        setBlogDetailsModalOpen(true);
    };

    const closeBlogDetailsModal = () => {
        setSelectedBlog(null);
        setBlogDetailsModalOpen(false);
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
    };

    const openEditBlogModal = (blog) => {
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setBlogFormData({
            title: blog.title || '',
            author_name: blog.author_name || '',
            publish_date: formatDateForInput(blog.publish_date),
            read_time: blog.read_time || '',
            keywords: blog.keywords || '',
            content: blog.content || '',
            category_id: blog.category_id || '',
            is_active: blog.is_active === 1,
            html_content: blog.html_content || '',
            image_url: blog.image_url || '',
            image_file: null
        });
        setEditingBlogId(blog.id);
        setEditBlogModalOpen(true);
    };

    const closeEditBlogModal = () => {
        setEditBlogModalOpen(false);
        setEditingBlogId(null);
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
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBlogFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
        setBlogFormData(prev => ({
            ...prev,
            image_url: e.target.value,
            image_file: null // Clear file when URL is entered
        }));
    };

    const clearImageInput = () => {
        setBlogFormData(prev => ({
            ...prev,
            image_file: null,
            image_url: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', blogFormData.title);
            formData.append('author_name', blogFormData.author_name);
            formData.append('publish_date', blogFormData.publish_date);
            formData.append('read_time', blogFormData.read_time);
            formData.append('keywords', blogFormData.keywords);
            formData.append('content', blogFormData.content);
            formData.append('category_id', blogFormData.category_id);
            formData.append('is_active', blogFormData.is_active ? 1 : 0);
            formData.append('html_content', blogFormData.html_content);

            if (blogFormData.image_file) {
                formData.append('image', blogFormData.image_file);
            } else if (blogFormData.image_url) {
                formData.append('image_url', blogFormData.image_url);
            }

            const url = editBlogModalOpen 
                ? `${API_Endpoint}admin/blogs/${editingBlogId}`
                : `${API_Endpoint}admin/blogs`;

            const method = editBlogModalOpen ? 'put' : 'post';

            await axios({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });

            toast.success(editBlogModalOpen ? 'Blog updated successfully!' : 'Blog created successfully!', {
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
            if (editBlogModalOpen) {
                closeEditBlogModal();
            } else {
                closeAddBlogModal();
            }
            fetchBlogs(currentPage, filter); // Refresh the blog list
        } catch (error) {
            console.error('Error submitting blog:', error);
            setIsSubmitting(false);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            } else {
                const errorMessage = error.response?.data?.message || 'Error submitting blog';
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
            }
        }
    };

    const handleToggleActivation = async (blogId, currentStatus) => {
        const newStatus = currentStatus == '1' ? 0 : 1;
        const id = toast.info('Updating status...', {
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
                method: 'put',
                url: `${API_Endpoint}admin/blogs/${blogId}/status?status=${newStatus}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
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
            fetchBlogs(currentPage, filter); // Refresh blog list
        } catch (error) {
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            } else {
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
            }
            console.error('Error updating blog status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
                        <p className="text-gray-600">Manage and publish blog articles and content</p>
                    </div>
                    <button
                        onClick={openAddBlogModal}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <IoAdd className="w-4 h-4" />
                        <span>Add New Blog</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search blogs by title or author..."
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
                                All Blogs
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'active' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('active')}
                            >
                                Active Blogs
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'inactive' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('inactive')}
                            >
                                Inactive Blogs
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Publish Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Read Time
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
                                    {blogs.map(blog => (
                                        <tr key={blog.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={blog.title}>
                                                    {blog.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{blog.author_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{blog.category?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(blog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{blog.read_time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Toggle
                                                        checked={blog.is_published == '1' || blog.is_published === 1}
                                                        onChange={() => handleToggleActivation(blog.id, blog.is_published)}
                                                        icons={false}
                                                        aria-label="Blog status"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => openBlogDetailsModal(blog)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditBlogModal(blog)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Edit Blog"
                                                    >
                                                        <IoCreate className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(blog)}
                                                        className="text-red-600 hover:text-red-900"
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
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IoNewspaper className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
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
                    <h2 className="text-2xl mb-4 font-semibold">{editBlogModalOpen ? "Edit Blog" : "Add New Blog"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={blogFormData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                                <input
                                    type="text"
                                    name="author_name"
                                    value={blogFormData.author_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date *</label>
                                <input
                                    type="date"
                                    name="publish_date"
                                    value={blogFormData.publish_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (e.g., 5) *</label>
                                <input
                                    type="text"
                                    name="read_time"
                                    value={blogFormData.read_time}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    name="category_id"
                                    value={blogFormData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {Array.isArray(categories) && categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (SEO)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={blogFormData.keywords}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>
                        </div>
                        
                        {/* Image Input Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Blog Image</h3>
                            
                            {/* Image URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={blogFormData.image_url}
                                        onChange={handleImageUrlChange}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearImageInput}
                                        className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image File</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                            {(blogFormData.image_url || blogFormData.image_file) && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                            <textarea
                                name="html_content"
                                value={blogFormData.html_content}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                                rows="6"
                                placeholder="Enter your HTML code here..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={editBlogModalOpen ? closeEditBlogModal : closeAddBlogModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#0F2005] text-white px-4 py-2 rounded disabled:opacity-50"
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
                            <h2 className="text-2xl mb-4 font-semibold">Blog Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <p className="text-gray-900">{selectedBlog.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <p className="text-gray-900">{selectedBlog.author_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                    <p className="text-gray-900">
                                        {new Date(selectedBlog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                                    <p className="text-gray-900">{selectedBlog.read_time}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                                    <p className="text-gray-900">{selectedBlog.keywords}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <p className="text-gray-900">{selectedBlog.category?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <p className="text-gray-900">{selectedBlog.is_published == '1' || selectedBlog.is_published === 1 ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                                        <div className="max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                                            <pre className="text-xs whitespace-pre-wrap">{selectedBlog.html_content}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center mt-6">
                                <button
                                    type="button"
                                    className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
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