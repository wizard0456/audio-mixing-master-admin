import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "./Sidebar";
import { useLocation, Navigate } from 'react-router-dom';
import LOGO from "../assets/images/logo.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { addUser, selectUser } from '../reducers/authSlice';
import Cookies from 'js-cookie';

const Layout = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false);
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

    return (
        <div className="position-relative top-0 flex h-screen">
            <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
            <main className="body-wrapper relative z-10">
                <header className='top-header flex items-center justify-between bg-[#091600] p-5'>
                    <img src={LOGO} className='w-20' alt="Logo" />
                    <button className='hamburger-icon-wrapper' onClick={() => setOpenSidebar(!openSidebar)}>
                        <RxHamburgerMenu className='w-20' color='white' size={25} />
                    </button>
                </header>
                {children}
            </main>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node.isRequired
}

export default Layout;
