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
import { BsFillFileMusicFill, BsMusicNoteList } from 'react-icons/bs';
import { PiImageSquareFill, PiMusicNotesPlus } from 'react-icons/pi';
import { MdCategory, MdDashboard, MdPeople, MdEngineering, MdShoppingCart, MdLocalOffer, MdArticle, MdPhotoLibrary, MdAudiotrack, MdEmail, MdPhone, MdCloudUpload } from 'react-icons/md';
import { IoAnalytics, IoPeopleCircle, IoConstruct, IoCart, IoMusicalNotes, IoPricetags, IoGrid, IoNewspaper, IoImages, IoMusicalNote, IoMail, IoCall, IoCloudUpload } from 'react-icons/io5';
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
      icon: <IoAnalytics className="w-5 h-5" />,
      roles: ['admin'],
      badge: "New"
    },
    {
      path: "/users",
      name: "Users",
      icon: <IoPeopleCircle className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/engineers",
      name: "Engineers",
      icon: <IoConstruct className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/orders",
      name: "Orders",
      icon: <IoCart className="w-5 h-5" />,
      roles: ['admin', 'engineer', 'user']
    },
    {
      path: "/services",
      name: "Services",
      icon: <IoMusicalNotes className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/labels",
      name: "Labels",
      icon: <IoPricetags className="w-5 h-5" />,
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
      icon: <IoPricetags className="w-5 h-5" />,
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
      icon: <IoNewspaper className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/gallery",
      name: "Gallery",
      icon: <IoImages className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/samples",
      name: "Samples",
      icon: <IoMusicalNote className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/new-letter",
      name: "News Letter",
      icon: <IoMail className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/contact-us",
      name: "Contact Form",
      icon: <IoCall className="w-5 h-5" />,
      roles: ['admin']
    },
    {
      path: "/order-us",
      name: "Uploads",
      icon: <IoCloudUpload className="w-5 h-5" />,
      roles: ['admin']
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {openSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out lg:translate-x-0 ${
        openSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-72 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-emerald-500/20">
                <FaMusic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">AMM Admin</h1>
                <p className="text-slate-400 text-sm">Audio Mixing & Mastering</p>
              </div>
            </div>
            <button 
              onClick={() => setOpenSidebar(false)} 
              className="text-slate-400 hover:text-white transition-colors duration-200 lg:hidden p-2 rounded-lg hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="mb-4">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                Main Navigation
              </h3>
            </div>
            
            {menuItems.map((item) => {
              if (!item.roles.includes(user?.role)) return null;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="group relative"
                  onClick={() => setOpenSidebar(false)}
                >
                  {({ isActive }) => (
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}>
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"></div>
                      )}
                      
                      {/* Icon */}
                      <span className={`transition-all duration-300 ${
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}>
                        {item.icon}
                      </span>
                      
                      {/* Text */}
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                      </div>
                      
                      {/* Badge */}
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300 group border border-slate-600/30 hover:border-red-500/30"
            >
              <FaSignOutAlt className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors duration-300" />
              <span className="font-medium">Logout</span>
            </button>
            
            {/* Version Info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500">v2.1.0 • Admin Panel</p>
            </div>
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