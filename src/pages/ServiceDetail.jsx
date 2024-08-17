import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const ServiceDetail = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchServiceDetail(id);
    }, [id]);

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
            setService(response.data);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                <Loading />
            </div>
        );
    }

    if (!service) {
        return <div>No service found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-semibold mb-4">{service.name}</h1>
            <div className="mb-4">
                <img src={Asset_Endpoint + service.image} alt="" />
            </div>
            <div className="mb-4">
                <strong>Service ID:</strong> {service.id}
            </div>
            <div className="mb-4">
                <strong>Category:</strong> {service.category ? service.category.name : '-'}
            </div>
            <div className="mb-4">
                <strong>Label:</strong> {service.label ? service.label.name : '-'}
            </div>
            <div className="mb-4">
                <strong>Price Before:</strong> ${service.price || '-'}
            </div>
            <div className="mb-4">
                <strong>Price After:</strong> ${service.discounted_price || '-'}
            </div>
            <div className="mb-4">
                <strong>Discount:</strong> {service.discounted_price ? `${((1 - service.discounted_price / service.price) * 100).toFixed(0)}%` : '-'}
            </div>
            <div className="mb-4">
                <strong>Service Type:</strong> {service.service_type || '-'}
            </div>
            <div className="mb-4">
                <strong>Detail:</strong> {service.detail || '-'}
            </div>
            <div className="mb-4">
                <strong>Tags:</strong> {service.tags || '-'}
            </div>
            <div className="mb-4">
                <strong>Created At:</strong> {new Date(service.created_at).toLocaleDateString()}
            </div>
        </div>
    );
};

export default ServiceDetail;
