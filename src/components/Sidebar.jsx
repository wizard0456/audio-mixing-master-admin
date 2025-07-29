import PropTypes from 'prop-types';
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/images/logo.png";
import { FaMusic, FaUsers, FaSignOutAlt, FaTags, FaEnvelope, FaPhone, FaClipboardList, FaChartPie, FaBlog } from "react-icons/fa";
import { GoChecklist } from 'react-icons/go';
import { BsFillFileMusicFill } from 'react-icons/bs';
import { PiImageSquareFill } from 'react-icons/pi';
import { MdCategory } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser); // Access roles from Redux store

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className={`sidebar ${openSidebar ? "active" : ""}`}>
      <div className="fixed top-0 h-full overflow-hidden py-10 bg-[#091600] z-50">
        <div className="sidebar-logo flex sm:items-start sm:justify-center">
          <img src={LOGO} className='w-32 h-fit' alt="logo" />
          <div className="sidebar-close-btn">
            <button onClick={() => setOpenSidebar(false)} className="text-white">🗙</button>
          </div>
        </div>

        <ul className="sidebar-list flex flex-col gap-2 pr-2 mx-5 overflow-auto">
          {user.role == 'admin' && (
            <li className="block w-full">
              <NavLink to="/dashboard" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                <span className="icon"><FaChartPie /></span>
                <span className="font-semibold relative top-[2px]">Dashboard</span>
              </NavLink>
            </li>
          )}
          {user.role == 'admin' && (
            <li className="block w-full">
              <NavLink to="/users" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                <span className="icon"><FaUsers /></span>
                <span className="font-semibold relative top-[2px]">User</span>
              </NavLink>
            </li>
          )}
          {user.role == 'admin' && (
            <li className="block w-full">
              <NavLink to="/engineers" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                <span className="icon"><FaUsers /></span>
                <span className="font-semibold relative top-[2px]">Engineers</span>
              </NavLink>
            </li>
          )}
          {user.role == 'admin' || user.role == 'engineer' || user.role == 'user' ? (
            <li className="block w-full">
              <NavLink to="/orders" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                <span className="icon"><GoChecklist /></span>
                <span className="font-semibold relative top-[2px]">Orders</span>
              </NavLink>
            </li>
          ) : null}
          {user.role == 'admin' && (
            <>
              <li className="block w-full">
                <NavLink to="/services" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><BsFillFileMusicFill /></span>
                  <span className="font-semibold relative top-[2px]">Services</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/labels" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaTags /></span>
                  <span className="font-semibold relative top-[2px]">Labels</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/categories" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><MdCategory /></span>
                  <span className="font-semibold relative top-[2px]">Categorys</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/tags" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaTags /></span>
                  <span className="font-semibold relative top-[2px]">Tags</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/coupons" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaTags /></span>
                  <span className="font-semibold relative top-[2px]">Coupons</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/blog" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaBlog /></span>
                  <span className="font-semibold relative top-[2px]">Blog</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/gallery" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><PiImageSquareFill /></span>
                  <span className="font-semibold relative top-[2px]">Gallery</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/samples" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaMusic /></span>
                  <span className="font-semibold relative top-[2px]">Sample</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/new-letter" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaEnvelope /></span>
                  <span className="font-semibold relative top-[2px]">News Letter</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/contact-us" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon transform-[rotate(90deg)]"><FaPhone /></span>
                  <span className="font-semibold relative top-[2px]">Contact Form</span>
                </NavLink>
              </li>
              <li className="block w-full">
                <NavLink to="/order-us" className={({ isActive }) => `font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}>
                  <span className="icon"><FaClipboardList /></span>
                  <span className="font-semibold relative top-[2px]">Uploads</span>
                </NavLink>
              </li>
            </>
          )}
          <li className="block w-full">
            <button onClick={handleLogout} className='font-semibold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center'><span className="icon"><FaSignOutAlt /></span> <span className="font-semibold relative top-[2px]">Logout</span></button>
          </li>
        </ul>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  openSidebar: PropTypes.bool.isRequired,
  setOpenSidebar: PropTypes.func.isRequired,
}

export default Sidebar;