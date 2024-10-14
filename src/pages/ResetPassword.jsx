import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Slide, toast } from 'react-toastify';
import { useParams } from 'react-router-dom'; 
import Logo from "../assets/images/logo.png";
import { API_Endpoint } from '../utilities/constants';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing eye icons

const ResetPassword = () => {
    const { token } = useParams();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [passwordShown, setPasswordShown] = useState(false); // State for showing/hiding password
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false); // State for showing/hiding confirm password

    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordShown(!confirmPasswordShown);
    };

    const handleResetPassword = async (data) => {
        setLoading(true);
        try {
            await axios({
                method: 'post',
                url: `${API_Endpoint}auth/reset-password`,
                data: {
                    token,
                    password: data.password
                }
            });
            toast.success('Password reset successfully', {
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-[#091600] text-white rounded-[20px] p-8 w-full max-w-md">
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img src={Logo} alt="Logo" className="h-16 w-32" />
                        </div>
                        <h1 className="font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold tracking-[.5em] text-center">RESET PASSWORD</h1>
                    </div>
                </div>
                <form onSubmit={handleSubmit(handleResetPassword)}>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="password">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={passwordShown ? 'text' : 'password'}
                                id="password"
                                {...register('password', { required: 'Password is required' })}
                                className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter New Password"
                            />
                            <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                {passwordShown ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={confirmPasswordShown ? 'text' : 'password'}
                                id="confirmPassword"
                                {...register('confirmPassword', {
                                    required: 'Confirm Password is required',
                                    validate: (value) => value === watch('password') || 'Passwords do not match'
                                })}
                                className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Confirm New Password"
                            />
                            <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                {confirmPasswordShown ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`font-THICCCBOI-SemiBold text-base leading-[18px] text-center w-full ${loading ? 'bg-green-400' : 'bg-[#4BC500]'} text-white font-semibold py-4 px-5 rounded-lg transition duration-300`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;