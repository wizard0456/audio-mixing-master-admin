import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal'; // Import the ConfirmationModal component
import Loading from '../components/Loading';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [imageToDelete, setImageToDelete] = useState(null);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await axios({
                    method: 'get',
                    url: `${API_Endpoint}admin/gallary`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                setImages(response.data);
                setLoading(false);
            } catch (error) {
                if (error.response.status === 401) {
                    dispatch(logout());
                }
                console.error('Error fetching gallery data:', error);
                setLoading(false);
                toast.error("Error fetching gallery data.");
            }
        };

        fetchGallery();
    }, [dispatch, user.token]);

    const handleImageUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        if (!selectedImage) return alert('Please select an image');

        formData.append('image', selectedImage);
        setUploading(true);

        try {
            const response = await axios({
                method: 'post',
                url: `${API_Endpoint}admin/gallary`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });

            setImages([response.data, ...images]);
            setUploading(false);
            closeModal();
            toast.success("Image uploaded successfully!", {
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
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error uploading image:', error);
            setUploading(false);
            toast.error("Error uploading image.", {
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

    const handleImageUploadForm = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreviewUrl(null);
        }
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedImage(null);
        setImagePreviewUrl(null);
    };

    const openConfirmationModal = (imageId) => {
        setImageToDelete(imageId);
    };

    const closeConfirmationModal = () => {
        setImageToDelete(null);
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;

        setIsDeleting(true);

        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/gallary/${imageToDelete}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setImages(images.filter(image => image.id !== imageToDelete));
            closeConfirmationModal();
            setIsDeleting(false);
            toast.success("Image deleted successfully!", {
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
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            setIsDeleting(false);
            console.error('Error deleting image:', error);
            toast.error("Error deleting image.", {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
                        <p className="text-gray-600">Upload and manage gallery images</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaPlus className="w-4 h-4 mr-1" />
                        <span>Upload Images</span>
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {images.map(image => (
                                <div key={image.id} className="relative group overflow-hidden rounded-xl shadow-sm border border-gray-200">
                                    <img 
                                        src={`${Asset_Endpoint}${image.image}`} 
                                        alt={`Gallery ${image.id}`} 
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => openConfirmationModal(image.id)}
                                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300 transform scale-90 group-hover:scale-100"
                                            title="Delete Image"
                                        >
                                            <FaTrashAlt className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-semibold text-xl">G</span>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload your first image to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Image Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Upload Image Modal"
                className="modern-modal"
            >
                <div className="max-w-2xl w-full">
                    <h2 className="text-2xl mb-6 font-semibold text-gray-900">Upload New Image</h2>
                    <form onSubmit={handleImageUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="image">
                                Select Image
                            </label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                onChange={handleImageUploadForm}
                                required
                            />
                        </div>
                        
                        {imagePreviewUrl && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Image Preview</label>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <img 
                                        src={imagePreviewUrl} 
                                        alt="Image Preview" 
                                        className="w-full h-auto max-h-64 object-cover" 
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
                                onClick={closeModal}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                                disabled={uploading || !selectedImage}
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!imageToDelete}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteImage}
                title="Delete Image"
                message="Are you sure you want to delete this image? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
}

export default Gallery;