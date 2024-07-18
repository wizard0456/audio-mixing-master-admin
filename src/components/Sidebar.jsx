import PropTypes from 'prop-types';
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/images/logo.png";
import { FaMusic, FaUsers, FaSignOutAlt, FaTags } from "react-icons/fa";
import { GoChecklist } from 'react-icons/go';
import { BsFillFileMusicFill } from 'react-icons/bs';
import { PiImageSquareFill } from 'react-icons/pi';
import { MdCategory } from 'react-icons/md'; // Add category icon
import { useDispatch } from 'react-redux';
import { logout } from '../reducers/authSlice';

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className={`sidebar ${openSidebar ? "active" : ""}`}>
      <div className="fixed top-0 h-full overflow-hidden bg-[#091600] z-50">
        <div className="sidebar-logo flex sm:items-start sm:justify-center">
          <img src={LOGO} className='w-32 h-16' alt="logo" />

          <div className="sidebar-close-btn">
            <button onClick={() => setOpenSidebar(false)} className="text-white">🗙</button>
          </div>
        </div>

        <ul className="sidebar-list flex flex-col gap-5 mx-5">
          <li className="block w-full">
            <NavLink to="/users" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><FaUsers /></span> <span className="font-semibold relative top-[2px]">User</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/orders" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><GoChecklist /></span> <span className="font-semibold relative top-[2px]">Orders</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/services" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><BsFillFileMusicFill /></span> <span className="font-semibold relative top-[2px]">Services</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/labels" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><FaTags /></span> <span className="font-semibold relative top-[2px]">Labels</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/categories" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><MdCategory /></span> <span className="font-semibold relative top-[2px]">Categorys</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/gallery" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><PiImageSquareFill /></span> <span className="font-semibold relative top-[2px]">Gallery</span></NavLink>
          </li>
          <li className="block w-full">
            <NavLink to="/samples" className={({ isActive }) => `font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center ${isActive ? "bg-[#0F2005] active" : ""}`}> <span className="icon"><FaMusic /></span> <span className="font-semibold relative top-[2px]">Sample</span></NavLink>
          </li>
          <li className="block w-full">
            <button onClick={handleLogout} className='font-semibold font-THICCCBOI-SemiBold text-base leading-4 text-white flex rounded-lg align-center py-3 px-5 gap-2 items-center'><span className="icon"><FaSignOutAlt /></span> <span className="font-semibold relative top-[2px]">Logout</span></button>
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

export default Sidebar