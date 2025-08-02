import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaSearch, FaFilter, FaUpload, FaDownload, FaFile } from "react-icons/fa";
import { IoEye, IoTrash, IoSearch, IoFilter, IoCloudUpload, IoDownload, IoDocument, IoAdd } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import Loading from '../components/Loading';
import ConfirmationModal from '../components/ConfirmationModal';

const Uploads = () => {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUpload, setSelectedUpload] = useState(null);
    const [uploadDetailsModalOpen, setUploadDetailsModalOpen] = useState(false);
    const [uploadDetailsLoading, setUploadDetailsLoading] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [uploadToDelete, setUploadToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = useSelector(selectUser);
    const abortController = useRef(null);

    useEffect(() => {
        fetchUploads();
    }, [currentPage, filter, searchQuery]);

    const fetchUploads = async () => {
        try {
            setLoading(true);
            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();

            let url = `${API_Endpoint}admin/uploads?page=${currentPage + 1}&per_page=${Per_Page}`;
            if (filter !== 'all') {
                url += `&type=${filter}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                signal: abortController.current.signal,
            });
            setUploads(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setLoading(false);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching uploads:', error);
                setLoading(false);
            }
        }
    };

    const fetchUploadDetails = async (uploadId) => {
        try {
            setUploadDetailsLoading(true);
            const response = await axios.get(`${API_Endpoint}admin/uploads/${uploadId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setSelectedUpload(response.data);
            setUploadDetailsLoading(false);
        } catch (error) {
            console.error('Error fetching upload details:', error);
            setUploadDetailsLoading(false);
        }
    };

    const handlePageChange = (data) => {
        setCurrentPage(data.selected);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const openConfirmationModal = (upload) => {
        setUploadToDelete(upload);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setConfirmationModalOpen(false);
        setUploadToDelete(null);
    };

    const handleDeleteUpload = async () => {
        if (!uploadToDelete) return;

        try {
            setIsDeleting(true);
            await axios.delete(`${API_Endpoint}admin/uploads/${uploadToDelete.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchUploads();
            closeConfirmationModal();
            toast.success('File deleted successfully', {
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
            console.error('Error deleting upload:', error);
            setIsDeleting(false);
            toast.error('Error deleting file', {
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

    const openUploadDetailsModal = (upload) => {
        fetchUploadDetails(upload.id);
        setUploadDetailsModalOpen(true);
    };

    const closeUploadDetailsModal = () => {
        setUploadDetailsModalOpen(false);
        setSelectedUpload(null);
    };

    const handleDownload = (fileUrl, fileName) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen dark-bg animated-bg p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold dark-text mb-2">File Upload Management</h1>
                        <p className="dark-text-secondary">Manage uploaded files and media</p>
                    </div>
                    <button className="btn-primary flex items-center space-x-2">
                        <IoCloudUpload className="w-4 h-4" />
                        <span>Upload File</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 dark-text-muted w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search files by name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="modern-input pl-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-2">
                            <IoFilter className="dark-text-muted w-4 h-4" />
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'all' 
                                        ? 'green-gradient text-white shadow-lg' 
                                        : 'dark-card dark-text-secondary hover:bg-gray-800'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Files
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'audio' 
                                        ? 'green-gradient text-white shadow-lg' 
                                        : 'dark-card dark-text-secondary hover:bg-gray-800'
                                }`}
                                onClick={() => handleFilterChange('audio')}
                            >
                                Audio
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'image' 
                                        ? 'green-gradient text-white shadow-lg' 
                                        : 'dark-card dark-text-secondary hover:bg-gray-800'
                                }`}
                                onClick={() => handleFilterChange('image')}
                            >
                                Image
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'document' 
                                        ? 'green-gradient text-white shadow-lg' 
                                        : 'dark-card dark-text-secondary hover:bg-gray-800'
                                }`}
                                onClick={() => handleFilterChange('document')}
                            >
                                Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uploads Table */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            ) : (
                uploads.length !== 0 ? (
                    <div className="dark-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="modern-table-header">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Uploaded By
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Uploaded
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium dark-text-muted uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="modern-table-body divide-y divide-gray-700">
                                    {uploads.map(upload => (
                                        <tr key={upload.id} className="hover:bg-gray-800 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                                        <IoDocument className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium dark-text">{upload.filename}</div>
                                                        <div className="text-sm dark-text-muted">ID: {upload.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium green-gradient text-white">
                                                    {upload.file_type || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm dark-text">
                                                {formatFileSize(upload.file_size || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm dark-text">
                                                {upload.uploaded_by || 'System'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm dark-text">
                                                {new Date(upload.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => openUploadDetailsModal(upload)}
                                                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20 transition-all duration-200"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(upload.file_url, upload.filename)}
                                                        className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20 transition-all duration-200"
                                                        title="Download File"
                                                    >
                                                        <IoDownload className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(upload)}
                                                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-all duration-200"
                                                        title="Delete File"
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
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IoCloudUpload className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium dark-text">No uploaded files found</h3>
                        <p className="mt-1 text-sm dark-text-muted">Try adjusting your search or filter criteria.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && uploads.length > 0 && (
                <div className="mt-6">
                    <ReactPaginate
                        previousLabel={<FaAngleDoubleLeft />}
                        nextLabel={<FaAngleDoubleRight />}
                        pageCount={totalPages}
                        onPageChange={handlePageChange}
                        containerClassName="pagination"
                        pageClassName=""
                        pageLinkClassName=""
                        previousClassName=""
                        previousLinkClassName=""
                        nextClassName=""
                        nextLinkClassName=""
                        activeClassName="active"
                        disabledClassName="disabled"
                        forcePage={currentPage}
                    />
                </div>
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteUpload}
                title="Delete File"
                message="Are you sure you want to delete this file? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            <Modal
                isOpen={uploadDetailsModalOpen}
                onRequestClose={closeUploadDetailsModal}
                contentLabel="Upload Details"
                className="modern-modal"
            >
                {uploadDetailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loading />
                    </div>
                ) : (
                    selectedUpload && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">File Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <FaFile className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{selectedUpload.filename}</h3>
                                        <p className="text-gray-500">File ID: {selectedUpload.id}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">File Type</p>
                                        <p className="text-gray-900">{selectedUpload.file_type || 'Unknown'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">File Size</p>
                                        <p className="text-gray-900 font-semibold">{formatFileSize(selectedUpload.file_size || 0)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Uploaded By</p>
                                        <p className="text-gray-900">{selectedUpload.uploaded_by || 'System'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Upload Date</p>
                                        <p className="text-gray-900">
                                            {new Date(selectedUpload.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500 mb-1">File URL</p>
                                        <p className="text-gray-900 text-sm break-all">{selectedUpload.file_url || 'No URL available'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => handleDownload(selectedUpload.file_url, selectedUpload.filename)}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <FaDownload className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={closeUploadDetailsModal}
                                    className="btn-secondary"
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

export default Uploads; 