import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { addUser } from '../reducers/authSlice';
import Logo from "../assets/images/logo.png";
import { API_Endpoint } from '../utilities/constants';
import { Slide, toast } from 'react-toastify';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (data) => {
        setLoading(true);
        try {
            const response = await axios({
                method: 'post',
                url: `${API_Endpoint}auth/login`,
                data: {
                    email: data.email,
                    password: data.password,
                    role: "administeration"
                }
            });
            const result = response.data;
            dispatch(addUser({ token: result.token, id: result.id, role: result.role, permissions: result.permissions }));
            toast.success('Login successful', {
                position: "top-right",
                autoClose: 10000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "light",
                transition: Slide,
            });
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response.data.error, {
                position: "top-right",
                autoClose: 10000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined,
                theme: "light",
                transition: Slide,
            })
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-[#091600] text-white rounded-[20px] p-8 w-full max-w-md">
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img src={Logo} alt="Logo" className="h-16 w-32" />
                        </div>
                        <h1 className="font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold tracking-[.5em] text-center">ADMIN</h1>
                    </div>
                </div>
                <form onSubmit={handleSubmit(handleLogin)}>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register('email', { required: 'Email is required', pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: 'Invalid email address' } })}
                            className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter Email Address"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register('password', { required: 'Password is required' })}
                            className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter Password"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div className='mb-5 text-right w-full font-THICCCBOI-Regular text-base leading-4 font-normal'>
                        <Link to="/forgot-password" className="text-sm text-gray-300 hover:text-white">Forgot password?</Link>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`font-THICCCBOI-SemiBold text-base leading-[18px] text-center w-full ${loading ? 'bg-green-400' : 'bg-[#4BC500]'} text-white font-semibold py-4 px-5 rounded-lg transition duration-300`}
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;