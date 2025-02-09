import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdMenu, IoMdClose } from "react-icons/io";

const Navbar = () => {

    const secretKey = import.meta.env.VITE_APP_BACKEND_URL;
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const location = useLocation(); // Get current URL
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    const [showLogout, setShowLogout] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const res = await axios.post(
                `${secretKey}/auth/logout`,
                {}, // Empty body (no data needed for logout)
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("User logged out successfully");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/");
        } catch (error) {
            console.log("Error in logoutUser :", error);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-md md:border-b-2 md:border-amber-500">
            <div className="container mx-auto flex justify-between items-center py-3 px-4">
                {/* Desktop Navigation */}
                <ul className="hidden md:flex gap-6 font-bold">
                    <li>
                        <Link
                            to="/dashboard"
                            className={`text-gray-300 hover:text-amber-500 ${isActive("/dashboard") ? "text-amber-500 font-bold border-b-2 border-amber-500" : ""}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/host-event"
                            className={`text-gray-300 hover:text-amber-500 ${isActive("/host-event") ? "text-amber-500 font-bold border-b-2 border-amber-500" : ""}`}
                        >
                            Host Event
                        </Link>
                    </li>
                </ul>

                {/* User Section */}
                <div className="flex items-center gap-3 relative">
                    {token ? (
                        <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
                    ) : (
                        <span className="font-semibold text-gray-300">Guest</span>
                    )}

                    {!token && (
                        <button
                            className="cursor-pointer bg-amber-600 text-white rounded-md px-4 py-2 hover:bg-amber-700 transition-colors"
                            onClick={() => navigate("/")}
                        >
                            Login
                        </button>
                    )}

                    {/* Logout Dropdown */}
                    {token && (
                        <span
                            className="cursor-pointer text-gray-300 hover:text-amber-500"
                            onClick={() => setShowLogout(!showLogout)}
                        >
                            <BsThreeDotsVertical className="text-xl" />
                        </span>
                    )}

                    {showLogout && (
                        <div className="absolute right-0 top-12 bg-slate-700 shadow-md rounded-md py-2 w-32 text-center border border-slate-600">
                            <button className="cursor-pointer block w-full px-4 py-2 text-gray-300 hover:bg-slate-600">
                                Edit Profile
                            </button>
                            <button className="cursor-pointer block w-full px-4 py-2 text-red-400 hover:bg-slate-600" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="cursor-pointer md:hidden text-2xl text-white" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <IoMdClose /> : <IoMdMenu />}
                </button>
            </div>

            {/* Navigation for Mobile Devices */}
            {menuOpen && (
                <ul className="md:hidden flex flex-col bg-slate-700 py-3 space-y-2 items-center font-bold">
                    <li>
                        <Link
                            to="/dashboard"
                            className={`text-gray-300 hover:text-amber-500 ${isActive("/dashboard") ? "text-amber-500 border-b-2 border-amber-500" : ""}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/host-event"
                            className={`text-gray-300 hover:text-amber-500 ${isActive("/host-event") ? "text-amber-500 border-b-2 border-amber-500" : ""}`}
                        >
                            Host Event
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
};

export default Navbar;