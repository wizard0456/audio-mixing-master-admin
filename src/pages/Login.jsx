import Logo from "../assets/images/logo.png";

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-[#091600] text-white rounded-[20px] p-8 w-full max-w-md">
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img src={Logo} alt="Logo" className="h-16 w-32" />
                        </div>
                        <h1 className="font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold tracking-[.5em] text-center">ADMIN</h1>
                    </div>
                </div>
                <form>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter Email Address"
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block font-THICCCBOI-SemiBold text-[12px] leading-[14px] font-semibold mb-3" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="font-normal font-THICCCBOI-Regular text-base leading-4 w-full px-5 py-4 bg-[#0F2005] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter Password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="font-THICCCBOI-SemiBold text-base leading-[18px] text-center w-full bg-[#4BC500] text-white font-semibold py-4 px-5 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login