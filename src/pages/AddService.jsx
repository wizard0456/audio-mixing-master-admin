import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_Endpoint } from '../utilities/constants';

const AddService = () => {
    const [serviceData, setServiceData] = useState({
        category_id: '',
        label_id: '',
        name: '',
        image: null,
        one_time_price: '',
        one_time_discounted_price: '',
        monthly_price: '',
        monthly_discounted_price: '',
        brief_detail: '',
        includes: '',
        description: '',
        requirements: '',
        notes: '',
        tags: ''
    });
    const [adding, setAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [labels, setLabels] = useState([]);
    const [tags, setTags] = useState([]);
    const [serviceOption, setServiceOption] = useState('oneTime');
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategoriesLabelsAndTags();
    }, []);

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

    const handleAddService = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            const formData = new FormData();
            Object.keys({ ...serviceData }).forEach(key => {
                formData.append(key, serviceData[key]);
            });

            // Appending service option to formData
            formData.append('service_option', serviceOption);

            await axios({
                method: 'post',
                url: `${API_Endpoint}admin/services`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });
            toast.success("Service added successfully!", {
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
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error adding service:', error);
            setAdding(false);
            toast.error("Error adding service.", {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setServiceData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        setServiceData(prevData => ({ ...prevData, image: e.target.files[0] }));
    };

    const handleServiceOptionChange = (e) => {
        const selectedOption = e.target.value;
        setServiceOption(selectedOption);

        // Update serviceData based on the selected service option
        setServiceData(prevData => {
            let updatedData = { ...prevData };
            if (selectedOption === 'oneTime') {
                updatedData.monthly_price = 0;
                updatedData.monthly_discounted_price = 0;
            } else if (selectedOption === 'monthly') {
                updatedData.one_time_price = 0;
                updatedData.one_time_discounted_price = 0;
            }
            return updatedData;
        });
    };

    return (
        <section className='px-4 sm:px-5 py-8 sm:py-10'>
            <div className="mb-8 sm:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 sm:py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold text-xl sm:text-3xl font-semibold leading-7 sm:leading-9">Add Service</h1>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 sm:space-y-6 mx-auto">
                <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="service_option">Service Option</label>
                    <select
                        name="service_option"
                        value={serviceOption}
                        onChange={handleServiceOptionChange}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="oneTime">One-time</option>
                        <option value="monthly">Subscription</option>
                        <option value="both">Both</option>
                    </select>
                </div>

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

                {(serviceOption === 'oneTime' || serviceOption === 'both') && (
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
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="one_time_discounted_price">One-time Discounted Price</label>
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

                {(serviceOption === 'monthly' || serviceOption === 'both') && (
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
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="monthly_discounted_price">Monthly Discounted Price</label>
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

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="detail">Detail</label>
                        <textarea
                            name="detail"
                            value={serviceData.detail}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="brief_detail">Brief Detail</label>
                        <textarea
                            name="brief_detail"
                            value={serviceData.brief_detail}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                        ></textarea>
                    </div>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="includes">Includes</label>
                        <textarea
                            name="includes"
                            value={serviceData.includes}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                        ></textarea>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="description">Description</label>
                        <textarea
                            name="description"
                            value={serviceData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                        ></textarea>
                    </div>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="requirements">Requirements</label>
                        <textarea
                            name="requirements"
                            value={serviceData.requirements}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                        ></textarea>
                    </div>
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="notes">Notes</label>
                        <textarea
                            name="notes"
                            value={serviceData.notes}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                        ></textarea>
                    </div>
                </div>

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

                <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="image">Image</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

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
                        {adding ? 'Adding...' : 'Add Service'}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default AddService;