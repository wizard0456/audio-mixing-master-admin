import { useState,useEffect } from 'react';
import axios from 'axios';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import {  useNavigate } from 'react-router-dom';
import { API_Endpoint } from '../utilities/constants';

const AddService = () => {
    const [serviceData, setServiceData] = useState({
        name: '',
        price: '',
        discounted_price: '',
        monthly_price: '',
        monthly_discount_price: '',
        detail: '',
        brief_detail: '',
        includes: '',
        description: '',
        requirements: '',
        notes: '',
        tags: '',
        image: null,
        category_id: '',
        label_id: ''
    });
    const [isMonthly, setIsMonthly] = useState(false);
    const [adding, setAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [labels, setLabels] = useState([]);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategoriesAndLabels();
    }, []);

    const fetchCategoriesAndLabels = async () => {
        try {
            const [categoriesResponse, labelsResponse] = await Promise.all([
                axios.get(`${API_Endpoint}admin/categories`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                }),
                axios.get(`${API_Endpoint}admin/labels`, {
                    headers: { "Authorization": `Bearer ${user.token}` }
                })
            ]);
            setCategories(categoriesResponse.data.data);
            setLabels(labelsResponse.data.data);
        } catch (error) {
            console.error("Error fetching categories and labels", error);
        }
    };

    const handleAddService = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            const formData = new FormData();
            Object.keys(serviceData).forEach(key => {
                formData.append(key, serviceData[key]);
            });

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

    const handleToggleChange = () => {
        setIsMonthly(prevState => !prevState);
    };

    return (
        <div className="container mx-auto mt-10">
            <h2 className="text-2xl mb-4 font-semibold">Add Service</h2>
            <form onSubmit={handleAddService} className="space-y-4">
                {/* Add form fields for serviceData */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Service Name</label>
                    <input
                        type="text"
                        name="name"
                        value={serviceData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={serviceData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="discounted_price">Discounted Price</label>
                    <input
                        type="number"
                        name="discounted_price"
                        value={serviceData.discounted_price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="isMonthly">Monthly Data</label>
                    <Toggle
                        id="isMonthly"
                        defaultChecked={isMonthly}
                        onChange={handleToggleChange}
                    />
                </div>
                {isMonthly && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="monthly_price">Monthly Price</label>
                            <input
                                type="number"
                                name="monthly_price"
                                value={serviceData.monthly_price}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="monthly_discount_price">Monthly Discounted Price</label>
                            <input
                                type="number"
                                name="monthly_discount_price"
                                value={serviceData.monthly_discount_price}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="detail">Detail</label>
                    <textarea
                        name="detail"
                        value={serviceData.detail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="brief_detail">Brief Detail</label>
                    <textarea
                        name="brief_detail"
                        value={serviceData.brief_detail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="includes">Includes</label>
                    <textarea
                        name="includes"
                        value={serviceData.includes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
                    <textarea
                        name="description"
                        value={serviceData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requirements">Requirements</label>
                    <textarea
                        name="requirements"
                        value={serviceData.requirements}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">Notes</label>
                    <textarea
                        name="notes"
                        value={serviceData.notes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tags">Tags</label>
                    <input
                        type="text"
                        name="tags"
                        value={serviceData.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">Image</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category_id">Category</label>
                    <select
                        name="category_id"
                        value={serviceData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.length > 0 && categories?.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="label_id">Label</label>
                    <select
                        name="label_id"
                        value={serviceData.label_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    >
                        <option value="">Select Label</option>
                        {labels.length > 0 && labels?.map(label => (
                            <option key={label.id} value={label.id}>{label.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                        onClick={() => navigate('/services')}
                        disabled={adding}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                        disabled={adding}
                    >
                        {adding ? 'Adding...' : 'Add Service'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddService;
