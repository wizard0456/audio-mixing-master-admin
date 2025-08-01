import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaEye, FaTrashAlt, FaSearch, FaFilter, FaUpload, FaEdit, FaDownload, FaFile } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import { API_Endpoint } from '../utilities/constants';
import { useApiCall } from '../utilities/useApiCall';
import { toast } from 'react-toastify';
import { Slide } from 'react-toastify';
import Loading from '../components/Loading';
import ConfirmationModal from '../components/ConfirmationModal';
import ModernTable from '../components/ModernTable';

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
    const makeApiCall = useApiCall();
    const abortController = useRef(null);

    const Per_Page = 10;

    useEffect(() => {
        if (user.token) {
            makeApiCall(fetchUploads, currentPage, filter, searchQuery);
        }
    }, [currentPage, filter, searchQuery, user.token, makeApiCall]);

    const fetchUploads = async (page, filter, searchQuery) => {
        try {
            setLoading(true);
            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();

            let url = `${API_Endpoint}admin/uploads?page=${page}&per_page=${Per_Page}`;
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
            setCurrentPage(response.data.current_page || 1);
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
        setCurrentPage(data.selected + 1);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
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
            makeApiCall(fetchUploads, currentPage, filter);
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

    const getFileIcon = (fileType) => {
        if (fileType?.includes('image')) return '🖼️';
        if (fileType?.includes('audio')) return '🎵';
        if (fileType?.includes('video')) return '🎬';
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('document')) return '📝';
        return '📁';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Table headers configuration
    const tableHeaders = [
        {
            key: 'filename',
            label: 'File',
            subtitle: 'File Details',
            icon: <FaUpload className="w-5 h-5 text-white" />,
            render: (value, row) => (
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaFile className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{row.filename}</p>
                        <p className="text-sm text-gray-500">ID: {row.id}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'file_type',
            label: 'Type',
            subtitle: 'File Type',
            render: (value, row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.file_type || 'Unknown'}
                </span>
            )
        },
        {
            key: 'file_size',
            label: 'Size',
            subtitle: 'File Size',
            render: (value, row) => (
                <p className="text-gray-700 font-medium">{formatFileSize(row.file_size || 0)}</p>
            )
        },
        {
            key: 'uploaded_by',
            label: 'Uploaded By',
            subtitle: 'User',
            render: (value, row) => (
                <p className="text-gray-700 font-medium">{row.uploaded_by || 'System'}</p>
            )
        },
        {
            key: 'created_at',
            label: 'Uploaded',
            subtitle: 'Upload Date',
            isDate: true
        }
    ];

    // Table actions
    const tableActions = [
        {
            icon: <FaEye className="w-4 h-4" />,
            onClick: openUploadDetailsModal,
            className: "text-blue-600 hover:bg-blue-50",
            title: "View Details"
        },
        {
            icon: <FaDownload className="w-4 h-4" />,
            onClick: (row) => handleDownload(row.file_url, row.filename),
            className: "text-green-600 hover:bg-green-50",
            title: "Download File"
        },
        {
            icon: <FaTrashAlt className="w-4 h-4" />,
            onClick: openConfirmationModal,
            className: "text-red-600 hover:bg-red-50",
            title: "Delete File"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload Management</h1>
                        <p className="text-gray-600">Manage uploaded files and media</p>
                    </div>
                    <button className="btn-primary flex items-center space-x-2">
                        <FaUpload className="w-4 h-4" />
                        <span>Upload File</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                            <FaFilter className="text-gray-500 w-4 h-4" />
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'all' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Files
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'audio' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('audio')}
                            >
                                Audio
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'image' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleFilterChange('image')}
                            >
                                Image
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'document' 
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <ModernTable
                headers={tableHeaders}
                data={uploads}
                loading={loading}
                emptyMessage="No uploaded files found. Try adjusting your search or filter criteria."
                emptyIcon={FaUpload}
                actions={tableActions}
            />

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
                    />
                </div>
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteUpload}
                message="Are you sure you want to delete this file? This action cannot be undone."
                isDeleting={isDeleting}
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