import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx/Navbar';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />  {/* Here navbar will be common for all component */}
            <main className="flex-grow">
                <Outlet />  {/* It will render the child page content */}
            </main>
            {/* <Footer /> */}  {/* Here footer will be common for all component */}
        </div>
    );
}

export default Layout;