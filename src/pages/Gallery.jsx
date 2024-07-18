import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal'; // Import the ConfirmationModal component

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
                setImages(response.data.data);
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
            toast.error("Error uploading image.",{
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
            toast.success("Image deleted successfully!",{
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
            console.error('Error deleting image:', error);
            toast.error("Error deleting image.",{
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Gallery</h1>
                <button 
                    className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg"
                    onClick={openModal}
                >
                    Upload Images
                </button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Upload Image Modal"
            >
                <h2 className="text-2xl mb-4 font-semibold">Upload New Image</h2>
                <form onSubmit={handleImageUpload} className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">Select Image</label>
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*" 
                            className="w-full px-3 py-2 border rounded-md"
                            onChange={handleImageUploadForm}
                        />
                    </div>
                    {imagePreviewUrl && (
                        <div className="mb-4">
                            <img src={imagePreviewUrl} alt="Image Preview" className="w-full h-full object-cover rounded-lg" />
                        </div>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button"
                            className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                            onClick={closeModal}
                            disabled={uploading}
                        >
                            Close
                        </button>
                        <button 
                            type="submit"
                            className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                            disabled={uploading}
                        >
                            {uploading ? 'Saving...' : 'Save Image'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={!!imageToDelete}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteImage}
                message="Are you sure you want to delete this image?"
            />

            <div className="grid grid-cols-5 items-stretch gap-4">
                {images.length > 0 && images.map(image => (
                    <div key={image.id} className="gallery-image relative overflow-hidden">
                        <img src={`${Asset_Endpoint}${image.image}`} alt={`Gallery ${image.id}`} className="w-full h-full object-cover rounded-lg" />
                        <div className="gallery-buttons-wrapper absolute w-full h-fit py-5 flex items-center justify-center bg-black bg-opacity-50 rounded-b-lg">
                            <FaEye className="cursor-pointer" color="white" size={20} />
                        </div>
                        <div 
                            className='gallery-delete-wrapper absolute h-10 w-10 right-3 flex items-center justify-center bg-[#FF0000] rounded-full cursor-pointer'
                            onClick={() => openConfirmationModal(image.id)}
                        >
                            <FaTrashAlt className="cursor-pointer" color="white" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Gallery;