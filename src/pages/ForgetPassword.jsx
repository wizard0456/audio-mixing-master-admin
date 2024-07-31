import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Slide, toast } from 'react-toastify';
import Logo from "../assets/images/logo.png";
import { API_Endpoint } from '../utilities/constants';

const ForgetPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const handleForgetPassword = async (data) => {
        setLoading(true);
        try {
            await axios({
                method: 'post',
                url: `${API_Endpoint}auth/forget-password`,
                data: { email: data.email }
            });
            toast.success('Password reset link sent to your email', {
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
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-[#091600] text-white rounded-[20px] p-8 w-full max-w-md">
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img src={Logo} alt="Logo" className="h-16 w-32" />
                        </div>
                        <h1 className="font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold tracking-[.5em] text-center">FORGET PASSWORD</h1>
                    </div>
                </div>
                <form onSubmit={handleSubmit(handleForgetPassword)}>
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
                    <button
                        type="submit"
                        disabled={loading}
                        className={`font-THICCCBOI-SemiBold text-base leading-[18px] text-center w-full ${loading ? 'bg-green-400' : 'bg-[#4BC500]'} text-white font-semibold py-4 px-5 rounded-lg transition duration-300`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgetPassword;