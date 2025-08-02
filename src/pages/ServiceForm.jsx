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
import { FaTrashAlt } from 'react-icons/fa';
import 'react-quill/dist/quill.snow.css'; 

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
                category_id: data.category_id || '',
                label_id: data.label_id || '',
                name: data.name || '',
                image_url: data.image_url || '',
                image: null,
                one_time_price: data.service_type === 'one_time' ? data.price : '',
                one_time_discounted_price: data.service_type === 'one_time' ? data.discounted_price : 0,
                monthly_price: data.service_type === 'subscription' ? data.price : '',
                monthly_discounted_price: data.service_type === 'subscription' ? data.discounted_price : 0,
                brief_detail: data.brief_detail || '',
                includes: data.includes || '',
                description: data.description || '',
                requirements: data.requirements || '',
                notes: data.notes || '',
                tags: data.tags || '',
                is_active: data.is_active || 1,
                has_variation: data.has_variation || false,
                detail: data.detail || '',
            };

            setServiceData(updatedServiceData);
            setImageSource(data.is_url || '1');

            // Set variations if they exist
            if (data.variation && data.variation.length > 0) {
                setVariations(data.variation.map(v => ({
                    id: v.id,
                    name: v.name || '',
                    price: v.price || '',
                    discounted_price: v.discounted_price || 0
                })));
            }
        } catch (error) {
            console.error("Error fetching service detail", error);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async (event) => {
        event.preventDefault();
        setAdding(true);

        const formData = new FormData();
        formData.append('category_id', serviceData.category_id);
        formData.append('label_id', serviceData.label_id);
        formData.append('name', serviceData.name);
        formData.append('brief_detail', serviceData.brief_detail);
        formData.append('includes', serviceData.includes);
        formData.append('description', serviceData.description);
        formData.append('requirements', serviceData.requirements);
        formData.append('notes', serviceData.notes);
        formData.append('tags', serviceData.tags);
        formData.append('is_active', serviceData.is_active);
        formData.append('has_variation', serviceData.has_variation);
        formData.append('detail', serviceData.detail);

        if (serviceOption === 'oneTime') {
            formData.append('price', serviceData.one_time_price);
            formData.append('discounted_price', serviceData.one_time_discounted_price);
            formData.append('service_type', 'one_time');
        } else {
            formData.append('price', serviceData.monthly_price);
            formData.append('discounted_price', serviceData.monthly_discounted_price);
            formData.append('service_type', 'subscription');
        }

        if (imageSource === '1') {
            formData.append('image_url', serviceData.image_url);
            formData.append('is_url', '1');
        } else {
            if (serviceData.image) {
                formData.append('image', serviceData.image);
            }
            formData.append('is_url', '0');
        }

        // Add variations
        if (serviceData.has_variation && variations.length > 0) {
            formData.append('variations', JSON.stringify(variations));
        }

        // Add deleted variation IDs
        if (deletedVariationIds.length > 0) {
            formData.append('deleted_variation_ids', JSON.stringify(deletedVariationIds));
        }

        try {
            const url = isEditMode 
                ? `${API_Endpoint}admin/services/${id}` 
                : `${API_Endpoint}admin/services`;
            
            const method = isEditMode ? 'PUT' : 'POST';
            
            await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(isEditMode ? 'Service updated successfully!' : 'Service added successfully!', {
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

            navigate('/services');
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error('Error saving service.', {
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
            setAdding(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setServiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (name, value) => {
        setServiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setServiceData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleServiceOptionChange = (e) => {
        setServiceOption(e.target.value);
    };

    const handleToggleChange = () => {
        setServiceData(prev => ({ ...prev, is_active: prev.is_active === 1 ? 0 : 1 }));
    };

    const handleImageSourceChange = (source) => {
        setImageSource(source);
        if (source === '1') {
            setServiceData(prev => ({ ...prev, image: null }));
        } else {
            setServiceData(prev => ({ ...prev, image_url: '' }));
        }
    };

    const handleVariationToggleChange = () => {
        setServiceData(prev => ({ ...prev, has_variation: !prev.has_variation }));
    };

    const handleVariationChange = (index, field, value) => {
        setVariations(prevVariations => {
            const updatedVariations = [...prevVariations];
            updatedVariations[index] = { ...updatedVariations[index], [field]: value };
            return updatedVariations;
        });
    };

    const addNewVariation = () => {
        setVariations(prev => [...prev, { id: null, name: '', price: '', discounted_price: 0 }]);
    };

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
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">
                            {isEditMode ? 'Edit Service' : 'Add Service'}
                        </h1>
                        <p className="page-subtitle dark-text-secondary">
                            {isEditMode ? 'Update service information' : 'Create a new service'}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loading />
                </div>
            ) : (
                <div className="dark-card p-6 border border-slate-700/50 rounded-lg">
                    <form onSubmit={handleSaveService} className="space-y-6">
                        {/* Service Option */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium dark-text-muted mb-2">Service Option</label>
                            <select
                                name="service_option"
                                value={serviceOption}
                                onChange={handleServiceOptionChange}
                                className="modern-input w-full"
                            >
                                <option value="oneTime">One-time</option>
                                <option value="monthly">Subscription</option>
                            </select>
                        </div>

                        {/* Service Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="name">Service Name</label>
                            <input
                                type="text"
                                name="name"
                                value={serviceData.name}
                                onChange={handleInputChange}
                                className="modern-input w-full"
                                required
                            />
                        </div>

                        {/* Pricing Fields */}
                        {(serviceOption === 'oneTime') && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="one_time_price">One-time Price</label>
                                    <input
                                        type="number"
                                        name="one_time_price"
                                        value={serviceData.one_time_price}
                                        onChange={handleInputChange}
                                        className="modern-input w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="one_time_discounted_price">One-time Discounted Price (If there is no discount please enter 0)</label>
                                    <input
                                        type="number"
                                        name="one_time_discounted_price"
                                        value={serviceData.one_time_discounted_price}
                                        onChange={handleInputChange}
                                        className="modern-input w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {(serviceOption === 'monthly') && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="monthly_price">Monthly Price</label>
                                    <input
                                        type="number"
                                        name="monthly_price"
                                        value={serviceData.monthly_price}
                                        onChange={handleInputChange}
                                        className="modern-input w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="monthly_discounted_price">Monthly Discounted Price (If there is no discount please enter 0)</label>
                                    <input
                                        type="number"
                                        name="monthly_discounted_price"
                                        value={serviceData.monthly_discounted_price}
                                        onChange={handleInputChange}
                                        className="modern-input w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Category and Label */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div className="mb-6">
                                <label className="block text-sm font-medium dark-text-muted mb-2">Category</label>
                                <select
                                    name="category_id"
                                    value={serviceData.category_id}
                                    onChange={handleInputChange}
                                    className="modern-input w-full"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium dark-text-muted mb-2">Label</label>
                                <select
                                    name="label_id"
                                    value={serviceData.label_id}
                                    onChange={handleInputChange}
                                    className="modern-input w-full"
                                    required
                                >
                                    <option value="">Select Label</option>
                                    {labels.map(label => (
                                        <option key={label.id} value={label.id}>{label.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium dark-text-muted mb-2">Active Status</label>
                            <Toggle
                                checked={serviceData.is_active == 1}
                                onChange={handleToggleChange}
                                icons={false}
                                className="modern-toggle"
                            />
                        </div>

                        {/* Image Upload */}
                        {isEditMode && (
                            <div className="mb-6 dark-card p-4 border border-slate-700/50 rounded-lg">
                                <p className="text-red-400 text-sm">Upload a new image to update, or leave blank to keep the current one.</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium dark-text-muted mb-2">Image Source</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center dark-text">
                                    <input
                                        type="radio"
                                        name="image_source"
                                        value="1"
                                        checked={imageSource == '1'}
                                        onChange={() => handleImageSourceChange('1')}
                                        className="mr-2"
                                    />
                                    Image Link
                                </label>
                                <label className="flex items-center dark-text">
                                    <input
                                        type="radio"
                                        name="image_source"
                                        value="0"
                                        checked={imageSource === '0'}
                                        onChange={() => handleImageSourceChange('0')}
                                        className="mr-2"
                                    />
                                    File Upload
                                </label>
                            </div>
                        </div>

                        {imageSource == '1' ? (
                            <div className="mb-6">
                                <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="image_url">Image Link</label>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={serviceData.image_url}
                                    onChange={handleInputChange}
                                    className="modern-input w-full"
                                    required={!isEditMode}
                                />
                            </div>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-sm font-medium dark-text-muted mb-2" htmlFor="image">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    className="modern-input w-full"
                                    required={!isEditMode}
                                />
                            </div>
                        )}

                        {/* Rich Text Editors */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Brief Detail</label>
                                <ReactQuill
                                    value={serviceData.brief_detail}
                                    onChange={(value) => handleEditorChange('brief_detail', value)}
                                    className="dark-editor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Includes</label>
                                <ReactQuill
                                    value={serviceData.includes}
                                    onChange={(value) => handleEditorChange('includes', value)}
                                    className="dark-editor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Description</label>
                                <ReactQuill
                                    value={serviceData.description}
                                    onChange={(value) => handleEditorChange('description', value)}
                                    className="dark-editor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Requirements</label>
                                <ReactQuill
                                    value={serviceData.requirements}
                                    onChange={(value) => handleEditorChange('requirements', value)}
                                    className="dark-editor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Notes</label>
                                <ReactQuill
                                    value={serviceData.notes}
                                    onChange={(value) => handleEditorChange('notes', value)}
                                    className="dark-editor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Detail</label>
                                <input
                                    type="text"
                                    name="detail"
                                    value={serviceData.detail}
                                    onChange={handleInputChange}
                                    className="modern-input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark-text-muted mb-2">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={serviceData.tags}
                                    onChange={handleInputChange}
                                    className="modern-input w-full"
                                />
                            </div>
                        </div>

                        {/* Variations */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium dark-text-muted">Has Variations</label>
                                <Toggle
                                    checked={serviceData.has_variation}
                                    onChange={handleVariationToggleChange}
                                    icons={false}
                                    className="modern-toggle"
                                />
                            </div>

                            {serviceData.has_variation && (
                                <div className="space-y-4">
                                    {variations.map((variation, index) => (
                                        <div key={index} className="dark-card p-4 border border-slate-700/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="dark-text font-medium">Variation {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariation(index)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium dark-text-muted mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        value={variation.name}
                                                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                                                        className="modern-input w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium dark-text-muted mb-2">Price</label>
                                                    <input
                                                        type="number"
                                                        value={variation.price}
                                                        onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                                                        className="modern-input w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addNewVariation}
                                        className="btn-primary"
                                    >
                                        Add Variation
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between sm:justify-end space-x-4 pt-6 border-t border-slate-700/50">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate('/services')}
                                disabled={adding}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={adding}
                            >
                                {adding ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Service' : 'Add Service')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ServiceForm;