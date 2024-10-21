import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast, Slide } from 'react-toastify';
import Toggle from 'react-toggle';
import { useNavigate, useParams } from 'react-router-dom';
import { API_Endpoint } from '../utilities/constants';
import { selectUser, logout } from '../reducers/authSlice';
import Loading from '../components/Loading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import { FaTrashAlt } from 'react-icons/fa';

const ServiceForm = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [serviceData, setServiceData] = useState({
        category_id: '',
        label_id: '',
        name: '',
        image_url: '',
        image: null,
        one_time_price: '',
        one_time_discounted_price: 0,
        monthly_price: '',
        monthly_discounted_price: 0,
        brief_detail: '',
        includes: '',
        description: '',
        requirements: '',
        notes: '',
        tags: '',
        is_active: 1,
        has_variation: false,
        detail: '',
    });

    // Variations now have independent price fields
    const [variations, setVariations] = useState([{ id: null, name: '', price: '', discounted_price: 0 }]);
    const [deletedVariationIds, setDeletedVariationIds] = useState([]);
    const [adding, setAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [labels, setLabels] = useState([]);
    const [tags, setTags] = useState([]);
    const [serviceOption, setServiceOption] = useState('oneTime');
    const [imageSource, setImageSource] = useState('1');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    useEffect(() => {
        fetchCategoriesLabelsAndTags();

        if (isEditMode) {
            fetchServiceDetail(id);
        }
    }, [id, isEditMode]);

    const fetchCategoriesLabelsAndTags = async () => {
        try {
            const [categoriesResponse, labelsResponse, tagsResponse] = await Promise.all([
                axios.get(`${API_Endpoint}admin/categories`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                }),
                axios.get(`${API_Endpoint}admin/labels`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                }),
                axios.get(`${API_Endpoint}admin/tags`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                })
            ]);
            setCategories(categoriesResponse.data.data);
            setLabels(labelsResponse.data.data);
            setTags(tagsResponse.data.data);
        } catch (error) {
            console.error("Error fetching categories, labels, and tags", error);
        }
    };

    const fetchServiceDetail = async (serviceId) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/services/${serviceId}`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            const data = response.data;

            // Set service option
            const serviceOption = data.service_type === 'subscription' ? 'monthly' : 'oneTime';
            setServiceOption(serviceOption);

            // Update service data
            const updatedServiceData = {
                ...data,
                one_time_price: serviceOption === 'oneTime' ? data.price : '',
                one_time_discounted_price: serviceOption === 'oneTime' ? data.discounted_price : 0,
                monthly_price: serviceOption === 'monthly' ? data.price : '',
                monthly_discounted_price: serviceOption === 'monthly' ? data.discounted_price : 0,
                is_active: data.is_active === "1" ? 1 : 0,
                has_variation: data.is_variation === 1 || data.is_variation === '1',
            };

            delete updatedServiceData.is_variation;

            setServiceData(updatedServiceData);
            setImageSource(data.is_url); // Reset the image source to the default state (image URL)

            // Set variations if they exist
            if (data.variation && data.variation.length > 0) {
                const fetchedVariations = data.variation.map(variation => ({
                    id: variation.id,
                    name: variation.name,
                    price: variation.price,
                    discounted_price: variation.discounted_price || 0, // Added discounted_price
                }));
                setVariations(fetchedVariations);
            } else {
                setVariations([{ id: null, name: '', price: '', discounted_price: 0 }]);
            }
        } catch (error) {
            console.error("Error fetching service detail", error);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            toast.error("Error fetching service detail.", {
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
            setLoading(false);
        }
    };

    const handleSaveService = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            const formData = new FormData();

            // Handle image
            if (imageSource === '1' && serviceData.image_url) {
                formData.append('image', serviceData.image_url);
            } else if (imageSource === '0' && serviceData.image) {
                formData.append('image', serviceData.image);
            }
            formData.append('is_url', imageSource); // Append the is_url field

            // Append other service data, excluding image, image_url, is_url, and has_variation
            Object.keys(serviceData).forEach(key => {
                if (key !== 'image' && key !== 'image_url' && key !== 'is_url' && key !== 'has_variation') {
                    formData.append(key, serviceData[key]);
                }
            });
            formData.append('service_option', serviceOption);

            // Automatically set has_variation to false if service option is subscription
            formData.append('is_variation', serviceOption === 'oneTime' ? (serviceData.has_variation ? 1 : 0) : 0);

            // Prepare variations data
            if (serviceOption === 'oneTime' && serviceData.has_variation) {
                const formattedVariations = variations.map(variation => ({
                    id: variation.id, // This could be null for new variations
                    name: variation.name,
                    price: variation.price,
                    discounted_price: variation.discounted_price, // Independent discounted_price
                }));
                formData.append('product_variation', JSON.stringify(formattedVariations));

                // Include deleted variation IDs
                if (deletedVariationIds.length > 0) {
                    formData.append('deleted_variation_ids', JSON.stringify(deletedVariationIds));
                }
            }

            const url = isEditMode
                ? `${API_Endpoint}admin/services-update/${id}`
                : `${API_Endpoint}admin/services`;

            await axios({
                method: "post",
                url,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(`Service ${isEditMode ? 'updated' : 'added'} successfully!`, {
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

            setAdding(false);
            navigate('/services');
        } catch (error) {
            const message = error.response?.data?.message || 'Error occurred';
            toast.error(`Error ${isEditMode ? 'updating' : 'adding'} service: ${message}`, {
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
            setAdding(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setServiceData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleEditorChange = (name, value) => {
        setServiceData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        setServiceData(prevData => ({ ...prevData, image: e.target.files[0] }));
    };

    const handleServiceOptionChange = (e) => {
        const selectedOption = e.target.value;
        setServiceOption(selectedOption);

        setServiceData(prevData => {
            let updatedData = { ...prevData };
            if (selectedOption === 'oneTime') {
                updatedData.monthly_price = '';
                updatedData.monthly_discounted_price = 0;
            } else if (selectedOption === 'monthly') {
                updatedData.one_time_price = '';
                updatedData.one_time_discounted_price = 0;
                updatedData.has_variation = false; // Automatically disable variation for subscription services
            }
            return updatedData;
        });
    };

    const handleToggleChange = () => {
        setServiceData(prevData => ({ ...prevData, is_active: prevData.is_active === 1 ? 0 : 1 }));
    };

    const handleImageSourceChange = (source) => {
        setImageSource(source);
        setServiceData(prevData => ({
            ...prevData,
            image_url: source === '1' ? '' : prevData.image_url,
            image: source === '0' ? null : prevData.image,
        }));
    };

    // Handle toggle for variation
    const handleVariationToggleChange = () => {
        setServiceData(prevData => ({ ...prevData, has_variation: !prevData.has_variation }));
    };

    // Handle variation field changes
    const handleVariationChange = (index, field, value) => {
        setVariations(prevVariations => {
            const updatedVariations = [...prevVariations];
            updatedVariations[index][field] = value;
            return updatedVariations;
        });
    };

    // Add new variation input fields
    const addNewVariation = () => {
        setVariations([...variations, { id: null, name: '', price: '', discounted_price: 0 }]);
    };

    // Remove variation
    const removeVariation = (index) => {
        setVariations(prevVariations => {
            const updatedVariations = [...prevVariations];
            const removedVariation = updatedVariations.splice(index, 1)[0];
            if (removedVariation.id) {
                setDeletedVariationIds(prevIds => [...prevIds, removedVariation.id]);
            }
            return updatedVariations;
        });
    };

    return (
        <section className='px-4 sm:px-5 py-8 sm:py-10'>
            <div className="mb-8 sm:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 sm:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold text-xl sm:text-3xl font-semibold leading-7 sm:leading-9">
                    {isEditMode ? 'Edit Service' : 'Add Service'}
                </h1>
            </div>

            {
                loading ? (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        <Loading />
                    </div>
                ) : (
                    <form onSubmit={handleSaveService} className="space-y-4 sm:space-y-6 mx-auto">
                        <div className="mb-4 sm:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Service Option</label>
                            <select
                                name="service_option"
                                value={serviceOption}
                                onChange={handleServiceOptionChange}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="oneTime">One-time</option>
                                <option value="monthly">Subscription</option>
                            </select>
                        </div>

                        {/* Service Name */}
                        <div className='grid grid-cols-1 gap-4 sm:gap-6'>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="name">Service Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={serviceData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        {/* Pricing Fields */}
                        {(serviceOption === 'oneTime') && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                                <div className="mb-4 sm:mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="one_time_price">One-time Price</label>
                                    <input
                                        type="number"
                                        name="one_time_price"
                                        value={serviceData.one_time_price}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4 sm:mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="one_time_discounted_price">One-time Discounted Price (If there is no discount please enter 0)</label>
                                    <input
                                        type="number"
                                        name="one_time_discounted_price"
                                        value={serviceData.one_time_discounted_price}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {(serviceOption === 'monthly') && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                                <div className="mb-4 sm:mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="monthly_price">Monthly Price</label>
                                    <input
                                        type="number"
                                        name="monthly_price"
                                        value={serviceData.monthly_price}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="mb-4 sm:mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="monthly_discounted_price">Monthly Discounted Price (If there is no discount please enter 0)</label>
                                    <input
                                        type="number"
                                        name="monthly_discounted_price"
                                        value={serviceData.monthly_discounted_price}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Hide Variation Section for Subscription */}
                        {serviceOption === 'oneTime' && (
                            <>
                                <div className='w-full flex justify-between items-center mb-4 sm:mb-6'>
                                    {/* Toggle for Has Variations */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Has Variation?</label>
                                        <Toggle
                                            checked={serviceData.has_variation}
                                            onChange={handleVariationToggleChange}
                                            icons={false}
                                        />
                                    </div>

                                    {serviceData.has_variation && (
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-sm sm:text-base font-semibold text-white px-3 sm:px-4 py-2 rounded"
                                            onClick={addNewVariation}
                                        >
                                            Add New Variation
                                        </button>
                                    )}
                                </div>

                                {serviceData.has_variation && (
                                    <div className="mb-4 sm:mb-6">
                                        <h2 className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Product Variations</h2>
                                        {variations.map((variation, index) => (
                                            <div key={index} className="flex justify-between gap-4 sm:gap-6 items-end">
                                                <div className='flex-1'>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        value={variation.name}
                                                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        required
                                                    />
                                                </div>
                                                <div className='flex-1'>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price</label>
                                                    <input
                                                        type="number"
                                                        value={variation.price}
                                                        onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        required
                                                    />
                                                </div>
                                                <div className='flex-1'>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Discounted Price</label>
                                                    <input
                                                        type="number"
                                                        value={variation.discounted_price}
                                                        onChange={(e) => handleVariationChange(index, 'discounted_price', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        className="bg-red-500 text-sm sm:text-base font-semibold text-white px-3 py-3 rounded"
                                                        onClick={() => removeVariation(index)}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Text Editors */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="detail">Detail</label>
                                <textarea
                                    name="detail"
                                    value={serviceData.detail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md h-52 resize-none"
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="brief_detail">Brief Detail</label>
                                <ReactQuill
                                    value={serviceData.brief_detail}
                                    onChange={(value) => handleEditorChange('brief_detail', value)}
                                    className="bg-white h-40"
                                />
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="includes">Includes</label>
                                <ReactQuill
                                    value={serviceData.includes}
                                    onChange={(value) => handleEditorChange('includes', value)}
                                    className="bg-white h-40"
                                />
                            </div>
                        </div>

                        {/* More Text Editors */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="description">Description</label>
                                <ReactQuill
                                    value={serviceData.description}
                                    onChange={(value) => handleEditorChange('description', value)}
                                    className="bg-white h-40"
                                />
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="requirements">Requirements</label>
                                <ReactQuill
                                    value={serviceData.requirements}
                                    onChange={(value) => handleEditorChange('requirements', value)}
                                    className="bg-white h-40"
                                />
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="notes">Notes</label>
                                <ReactQuill
                                    value={serviceData.notes}
                                    onChange={(value) => handleEditorChange('notes', value)}
                                    className="bg-white h-40"
                                />
                            </div>
                        </div>

                        {/* Select Fields */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="tags">Tags</label>
                                <select
                                    name="tags"
                                    value={serviceData.tags}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Tag</option>
                                    {tags.length > 0 && tags.map(tag => (
                                        <option key={tag.id} value={tag.tag_name}>{tag.tag_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="label_id">Label</label>
                                <select
                                    name="label_id"
                                    value={serviceData.label_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Label</option>
                                    {labels.length > 0 && labels.map(label => (
                                        <option key={label.id} value={label.id}>{label.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="category_id">Category</label>
                                <select
                                    name="category_id"
                                    value={serviceData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.length > 0 && categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="mb-4 sm:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Active Status</label>
                            <Toggle
                                checked={serviceData.is_active === 1}
                                onChange={handleToggleChange}
                                icons={false}
                            />
                        </div>

                        {/* Image Upload */}
                        {isEditMode && (
                            <div className="mb-4 bg-[#f8d7da] p-4 rounded">
                                <p className="text-red-500 text-sm">Upload a new image to update, or leave blank to keep the current one.</p>
                            </div>
                        )}

                        <div className="mb-4 sm:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Image Source</label>
                            <div className="flex space-x-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="image_source"
                                        value="1"
                                        checked={imageSource === '1'}
                                        onChange={() => handleImageSourceChange('1')}
                                    />{' '}
                                    Image Link
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="image_source"
                                        value="0"
                                        checked={imageSource === '0'}
                                        onChange={() => handleImageSourceChange('0')}
                                    />{' '}
                                    File Upload
                                </label>
                            </div>
                        </div>

                        {imageSource === '1' ? (
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="image_url">Image Link</label>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={serviceData.image_url}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required={!isEditMode}
                                />
                            </div>
                        ) : (
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="image">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required={!isEditMode}
                                />
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-between sm:justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 text-sm sm:text-base font-semibold text-white px-3 sm:px-4 py-2 rounded"
                                onClick={() => navigate('/services')}
                                disabled={adding}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="text-sm sm:text-[14px] bg-[#4BC500] text-white px-4 sm:px-5 py-2 rounded-lg"
                                disabled={adding}
                            >
                                {adding ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Service' : 'Add Service')}
                            </button>
                        </div>
                    </form>
                )
            }
        </section>
    );
};

export default ServiceForm;