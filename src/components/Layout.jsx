import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "./Sidebar";
import { useLocation } from 'react-router-dom';
import LOGO from "../assets/images/logo.png";
import { RxHamburgerMenu } from "react-icons/rx";

const Layout = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false);
    const location = useLocation();



    useLayoutEffect(() => {
        // Close the sidebar whenever the route changes
        setOpenSidebar(false);
    }, [location]);

    return (
        <>
            <div className="position-relative top-0 flex h-screen">
                <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
                <main className="body-wrapper relative z-10">
                    <header className='top-header flex items-center justify-between bg-[#091600] p-5'>
                        <img src={LOGO} className='w-20' alt="" />
                        <button className='hamburger-icon-wrapper' onClick={() => setOpenSidebar(!openSidebar)}>
                            <RxHamburgerMenu className='w-20' color='white' size={25} />
                        </button>
                    </header>
                    <div className='px-5 mt-10'>
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}

Layout.propTypes = {
    children: PropTypes.node
}

export default Layout;
