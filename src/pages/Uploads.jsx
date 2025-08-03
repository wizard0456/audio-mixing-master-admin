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
    const [currentPage, setCurrentPage] = useState(1);
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
        fetchUploads(currentPage, filter);
    }, [currentPage, filter]);

    const fetchUploads = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/uploads?page=${page}&per_page=${Per_Page}`;
        if (filter !== 'all') {
            url += `&type=${filter}`;
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
            setUploads(response.data.data || []);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching uploads", error);
                setLoading(false);
            }
        }
    };

    const fetchUploadDetails = async (uploadId) => {
        setUploadDetailsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: `${API_Endpoint}admin/uploads/${uploadId}`,
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

    const getFilteredUploads = () => {
        if (!searchQuery) return uploads;
        
        return uploads.filter(upload => 
            upload.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            upload.file_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            upload.uploaded_by?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const openConfirmationModal = (upload) => {
        setUploadToDelete(upload);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setUploadToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteUpload = async () => {
        if (!uploadToDelete) return;

        setIsDeleting(true);
        const id = toast.loading('Deleting file...', {
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
            await axios.delete(`${API_Endpoint}admin/uploads/${uploadToDelete.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            toast.dismiss(id);
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

            fetchUploads(currentPage, filter);
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
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
            console.error('Error deleting upload:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openUploadDetailsModal = (upload) => {
        setSelectedUpload(upload);
        setUploadDetailsModalOpen(true);
        fetchUploadDetails(upload.id);
    };

    const closeUploadDetailsModal = () => {
        setSelectedUpload(null);
        setUploadDetailsModalOpen(false);
    };

    const handleDownload = (fileUrl, fileName) => {
        if (!fileUrl) {
            toast.error('Download URL not available', {
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
            return;
        }

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Download started', {
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
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredUploads = getFilteredUploads();

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">File Uploads Management</h1>
                        <p className="page-subtitle dark-text-secondary">Manage and review all uploaded files across the platform</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder="Search files by name, type, or uploader..."
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
                                All Files
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'audio' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('audio')}
                            >
                                Audio
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'image' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
                                }`}
                                onClick={() => handleFilterChange('image')}
                            >
                                Image
                            </button>
                            <button
                                className={`filter-button ${
                                    filter === 'document' 
                                        ? 'filter-button-active' 
                                        : 'filter-button-inactive'
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
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                filteredUploads.length !== 0 ? (
                    <div className="dark-card table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">
                                            File
                                        </th>
                                        <th className="table-header-cell">
                                            Type
                                        </th>
                                        <th className="table-header-cell">
                                            Size
                                        </th>
                                        <th className="table-header-cell">
                                            Uploaded By
                                        </th>
                                        <th className="table-header-cell">
                                            Uploaded
                                        </th>
                                        <th className="table-header-cell">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {filteredUploads.map(upload => (
                                        <tr key={upload.id} className="table-row">
                                            <td className="table-cell whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {upload.filename.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium dark-text">{upload.filename}</div>
                                                        <div className="text-sm dark-text-muted">ID: {upload.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                                    {upload.file_type || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {formatFileSize(upload.file_size || 0)}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {upload.uploaded_by || 'System'}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm dark-text">
                                                {new Date(upload.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openUploadDetailsModal(upload)}
                                                        className="action-button action-button-view"
                                                        title="View Details"
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(upload.file_url, upload.filename)}
                                                        className="action-button action-button-download"
                                                        title="Download File"
                                                    >
                                                        <IoDownload className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal(upload)}
                                                        className="action-button action-button-delete"
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
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IoCloudUpload className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="empty-state-title dark-text">No uploaded files found</h3>
                        <p className="empty-state-description">Files will appear here when users upload them.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && filteredUploads.length > 0 && !searchQuery && (
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
                        forcePage={currentPage - 1}
                    />
                </div>
            )}

            {/* Filtering message */}
            {searchQuery && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredUploads.length} of {uploads.length} files matching "{searchQuery}"
                    </p>
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
                            <h2 className="text-2xl font-bold dark-text mb-6">File Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <FaFile className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold dark-text">{selectedUpload.filename}</h3>
                                        <p className="dark-text-muted">File ID: {selectedUpload.id}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="dark-card p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">File Type</p>
                                        <p className="dark-text">{selectedUpload.file_type || 'Unknown'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">File Size</p>
                                        <p className="dark-text font-semibold">{formatFileSize(selectedUpload.file_size || 0)}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">Uploaded By</p>
                                        <p className="dark-text">{selectedUpload.uploaded_by || 'System'}</p>
                                    </div>
                                    <div className="dark-card p-4 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">Upload Date</p>
                                        <p className="dark-text">
                                            {new Date(selectedUpload.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="dark-card p-4 md:col-span-2 border border-slate-700/50">
                                        <p className="text-sm font-medium dark-text-muted mb-1">File URL</p>
                                        <p className="dark-text text-sm break-all">{selectedUpload.file_url || 'No URL available'}</p>
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