import PropTypes from 'prop-types';
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/images/logo.png";
import { 
  FaMusic, 
  FaUsers, 
  FaSignOutAlt, 
  FaTags, 
  FaEnvelope, 
  FaPhone, 
  FaClipboardList, 
  FaChartPie, 
  FaBlog,
  FaCog,
  FaBell,
  FaHome,
  FaUserCog,
  FaGift,
  FaImage,
  FaFileAudio,
  FaUpload,
  FaUser
} from "react-icons/fa";
import { GoChecklist } from 'react-icons/go';
import { BsFillFileMusicFill } from 'react-icons/bs';
import { PiImageSquareFill } from 'react-icons/pi';
import { MdCategory } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <FaChartPie className="w-5 h-5" />,
      roles: ['admin'],
      badge: "New"
    },
    {
      path: "/users",
      name: "Users",
      icon: <FaUsers className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/engineers",
      name: "Engineers",
      icon: <FaUserCog className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/orders",
      name: "Orders",
      icon: <GoChecklist className="w-5 h-5" />,
      roles: ['admin', 'engineer', 'user']
    },
    {
      path: "/services",
      name: "Services",
      icon: <BsFillFileMusicFill className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/labels",
      name: "Labels",
      icon: <FaTags className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/categories",
      name: "Categories",
      icon: <MdCategory className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/tags",
      name: "Tags",
      icon: <FaTags className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/coupons",
      name: "Coupons",
      icon: <FaGift className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/blog",
      name: "Blog",
      icon: <FaBlog className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/gallery",
      name: "Gallery",
      icon: <FaImage className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/samples",
      name: "Samples",
      icon: <FaFileAudio className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/new-letter",
      name: "News Letter",
      icon: <FaEnvelope className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/contact-us",
      name: "Contact Form",
      icon: <FaPhone className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/order-us",
      name: "Uploads",
      icon: <FaUpload className="w-5 h-5" />,
      roles: ['admin']
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {openSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        openSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-72 h-full bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUser className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Audio Mixing</h1>
              </div>
            </div>
            <button 
              onClick={() => setOpenSidebar(false)} 
              className="text-slate-400 hover:text-white transition-colors duration-200 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {menuItems.map((item) => {
              if (!item.roles.includes(user.role)) return null;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                location.pathname === item.path
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                  onClick={() => setOpenSidebar(false)}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300 group"
            >
              <FaSignOutAlt className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  openSidebar: PropTypes.bool.isRequired,
  setOpenSidebar: PropTypes.func.isRequired,
};

export default Sidebar;