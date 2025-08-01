import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import { useApiCall } from '../utilities/useApiCall';
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
    const makeApiCall = useApiCall();

    useEffect(() => {
        if (user.token) {
            makeApiCall(fetchBlogs, currentPage, filter, searchQuery);
            fetchCategories();
        }
    }, [currentPage, filter, searchQuery, user.token, makeApiCall]);

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
            
            // Ensure blogs is always an array
            const blogsData = response.data?.data?.blogs || [];
            setBlogs(Array.isArray(blogsData) ? blogsData : []);
            setCurrentPage(response.data?.data?.pagination?.current_page || 1);
            setTotalPages(response.data?.data?.pagination?.total_pages || 1);
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
            const categoriesData = response.data?.data || [];
            setCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]); // Set empty array on error
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
            setSelectedBlog(response.data.data.blog);
            setBlogDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching blog details:', error);
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
            makeApiCall(fetchBlogs, currentPage, filter);
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
        setEditingBlogId(null);
        setAddBlogModalOpen(true);
        fetchCategories();
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
        // Convert ISO date to YYYY-MM-DD format for HTML date input
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setBlogFormData({
            id: blog.id,
            title: blog.title,
            author_name: blog.author_name,
            publish_date: formatDateForInput(blog.publish_date),
            read_time: blog.read_time,
            keywords: blog.keywords,
            content: blog.content,
            category_id: blog.category_id,
            is_published: blog.is_published,
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
        const { name, value, type, checked, files } = e.target;
        setBlogFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        }));
    };

    const handleContentChange = (content) => {
        setBlogFormData(prev => ({
            ...prev,
            content
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
            image_url: '',
            image_file: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', blogFormData.title);
        formData.append('author_name', blogFormData.author_name);
        formData.append('publish_date', blogFormData.publish_date);
        formData.append('read_time', blogFormData.read_time);
        formData.append('keywords', blogFormData.keywords);
        formData.append('content', blogFormData.content);
        formData.append('category_id', blogFormData.category_id);
        formData.append('is_published', blogFormData.is_active ? 1 : 0);
        formData.append('html_content', blogFormData.html_content);
        
        // Handle image - either file upload or URL
        if (blogFormData.image_file) {
            formData.append('image', blogFormData.image_file);
        } else if (blogFormData.image_url) {
            formData.append('image_url', blogFormData.image_url);
        }

        try {
            if (editingBlogId) {
                // Update blog
                await axios({
                    method: 'put',
                    url: `${API_Endpoint}admin/blogs/${editingBlogId}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                });
                toast.success('Blog updated successfully', {
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
                closeEditBlogModal();
            } else {
                // Add new blog
                await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/blogs`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                });
                toast.success('Blog added successfully', {
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
                closeAddBlogModal();
            }
            makeApiCall(fetchBlogs, currentPage, filter);
        } catch (error) {
            console.error('Error saving blog:', error);
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message, {
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
        const newStatus = currentStatus == '1' ? 1 : 0;
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
            makeApiCall(fetchBlogs, currentPage, filter);
        } catch (error) {
            toast.dismiss(id);
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
        <section className='px-4 py-8 md:px-5 md:py-10'>
            <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Blog Management</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className='flex items-center gap-2 w-full lg:w-auto'>
                    <input
                        type="text"
                        placeholder="Search blogs"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-4 py-2 rounded-md bg-white border border-gray-300 w-full lg:w-auto"
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Blogs
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Blogs
                    </button>
                    <button
                        className={`font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Blogs
                    </button>
                </div>
                <button
                    onClick={openAddBlogModal}
                    className="bg-[#0F2005] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-THICCCBOI-Medium font-medium text-[14px]"
                >
                    <FaPlus /> Add New Blog
                </button>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteBlog}
                message="Are you sure you want to delete this blog?"
                isDeleting={isDeleting}
            />

            {/* Blog Details Modal */}
            <Modal
                isOpen={blogDetailsModalOpen}
                onRequestClose={closeBlogDetailsModal}
                contentLabel="Blog Details"
                className="bg-white rounded-lg p-6 max-w-2xl mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                {blogDetailsLoading ? (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        <Loading />
                    </div>
                ) : (
                    selectedBlog && (
                        <div>
                            <h2 className="text-2xl mb-4 font-semibold">Blog Details</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <p>{selectedBlog.title}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <p>{selectedBlog.author_name}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                <p>{new Date(selectedBlog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                                <p>{selectedBlog.read_time}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                                <p>{selectedBlog.keywords}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <p>{selectedBlog.category?.name || 'N/A'}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <p>{selectedBlog.is_published == '1' ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <div className="max-h-40 overflow-y-auto border p-2 rounded" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                            </div>
                            {selectedBlog.html_content && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                                    <div className="max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                                        <pre className="text-xs whitespace-pre-wrap">{selectedBlog.html_content}</pre>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center">
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

            {/* Add/Edit Blog Modal */}
            <Modal
                isOpen={addBlogModalOpen || editBlogModalOpen}
                onRequestClose={editingBlogId ? closeEditBlogModal : closeAddBlogModal}
                contentLabel={editingBlogId ? "Edit Blog" : "Add New Blog"}
                className="bg-white rounded-lg p-6 max-w-4xl mx-auto mt-10 max-h-[90vh] overflow-y-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-2xl mb-4 font-semibold">{editingBlogId ? "Edit Blog" : "Add New Blog"}</h2>
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

                    {/* <div className="flex items-center gap-2">
                        <p><strong>Status:</strong></p>
                        <Toggle
                            checked={blogFormData.is_published == '1'}
                            onChange={() => handleToggleActivation(blogFormData.id, !blogFormData.is_published)}
                            icons={false}
                            aria-label="Blog status"
                        />
                    </div>
                     */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                        <SimpleTextEditor
                            value={blogFormData.content}
                            onChange={handleContentChange}
                            placeholder="Write your blog content here..."
                        />
                    </div> */}

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={editingBlogId ? closeEditBlogModal : closeAddBlogModal}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#0F2005] text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : (editingBlogId ? 'Update Blog' : 'Add Blog')}
                        </button>
                    </div>
                </form>
            </Modal>

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                (Array.isArray(blogs) && blogs.length !== 0) ? (
                    <div className="overflow-x-auto">
                        <table className='w-full border-0'>
                            <thead>
                                <tr>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Title</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Author</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Category</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Publish Date</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Read Time</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Status</th>
                                    <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map(blog => (
                                    <tr key={blog.id} className='bg-[#F6F6F6]'>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5 ">
                                            <div className='px-2 py-4  rounded-tl-lg rounded-bl-lg text-nowrap max-w-xs truncate' title={blog.title}>{blog.title}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-2 py-4  text-nowrap'>{blog.author_name}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-2 py-4  text-nowrap'>{blog.category?.name || 'N/A'}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-2 py-4  text-nowrap'>{new Date(blog.publish_date).toLocaleDateString("en-US",{month:'long',day:'numeric',year:'numeric'})}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-2 py-4  text-nowrap'>{blog.read_time}</div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='px-2 py-4 '>
                                                <div className="flex items-center gap-2">
                                                    <Toggle
                                                        checked={blog.is_published == '1'}
                                                        onChange={() => handleToggleActivation(blog.id, !blog.is_published)}
                                                        icons={false}
                                                        aria-label="Blog status"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                                <button onClick={() => openBlogDetailsModal(blog)} title="View Details">
                                                    <FaEye />
                                                </button>
                                                <button onClick={() => openEditBlogModal(blog)} title="Edit Blog">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => openConfirmationModal(blog)} title="Delete Blog">
                                                    <FaTrashAlt color="#FF0000" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No blogs found
                    </div>
                )
            )}

            {loading || (
                (Array.isArray(blogs) && blogs.length !== 0) && (
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
        </section>
    );
}

export default Blog; 