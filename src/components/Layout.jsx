import { useEffect, useState } from 'react';
import Sidebar from "./Sidebar";
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import LOGO from "../assets/images/logo.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { addUser, selectUser } from '../reducers/authSlice';
import Cookies from 'js-cookie';
import { 
  FaBell, 
  FaSearch, 
  FaCog, 
  FaUser,
  FaSignOutAlt,
  FaEnvelope,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { IoSearch, IoNotifications, IoPerson, IoSettings, IoMail, IoLogOut, IoMenu, IoClose } from 'react-icons/io5';

const Layout = () => {
    const [openSidebar, setOpenSidebar] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    useEffect(() => {
        // Close the sidebar whenever the route changes
        setOpenSidebar(false);
    }, [location]);

    useEffect(() => {
        const userDataFromCookies = Cookies.get("user");
        const userDataFromLocalStorage = localStorage.getItem("user");

        if (userDataFromLocalStorage) {
            const userData = JSON.parse(userDataFromLocalStorage);
            dispatch(addUser(userData));
        } else if (userDataFromCookies) {
            const userData = JSON.parse(userDataFromCookies);
            dispatch(addUser(userData));
        }
    }, [dispatch]);

    useEffect(() => {
        document.body.style.overflow = openSidebar ? "hidden" : "auto";
    }, [openSidebar]);

    if (user == null) {
        const userDataFromCookies = Cookies.get("user");
        const userDataFromLocalStorage = localStorage.getItem("user");

        if (userDataFromCookies || userDataFromLocalStorage) {
            // Prevent redirect if user data is found in cookies or local storage
            return null;
        }

        // Redirect to login if no user data is found
        return <Navigate to="/login" replace={true} />;
    }

    const handleLogout = () => {
        dispatch({ type: 'auth/logout' });
        setShowUserMenu(false);
    };

    return (
        <div className="flex h-screen dark-bg animated-bg">
            <Sidebar 
                openSidebar={openSidebar} 
                setOpenSidebar={setOpenSidebar}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            
            <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'lg:ml-16' : 'lg:ml-72'
            }`}>
                {/* Modern Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        {/* Left side - Logo and Menu */}
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setOpenSidebar(!openSidebar)}
                                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                            >
                                {openSidebar ? (
                                    <IoClose className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                ) : (
                                    <IoMenu className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                )}
                            </button>
                            
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <img src={LOGO} className="w-6 h-6" alt="Logo" />
                                </div>
                                <div className="hidden md:block">
                                    <h1 className="text-xl font-bold text-gray-900">Audio Mixing and Mastering</h1>
                                    <p className="text-sm text-gray-500">Admin Dashboard</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Search, Notifications, and User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* Notifications */}
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                            >
                                <IoNotifications className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <IoPerson className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                                    </div>
                                </button>

                                {/* User Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                    <FaUser className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="py-1">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200">
                                                <IoPerson className="w-4 h-4" />
                                                <span>Profile</span>
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200">
                                                <IoSettings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200">
                                                <IoMail className="w-4 h-4" />
                                                <span>Messages</span>
                                            </button>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200"
                                            >
                                                <IoLogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;