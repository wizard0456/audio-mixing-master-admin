import { useState } from 'react'
import PropTypes from 'prop-types'
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false);

    return (
        <>
            <div className="position-relative top-0 flex h-screen">
                <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
                <main className="body-wrapper relative z-10 px-5 py-10">
                    {children}
                </main>
            </div>
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node
}

export default Layout