import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';  // Ensure you style the navbar in a separate CSS file

const Navbar = () => {

    // Handle logout confirmation
    const handleLogout = (e) => {
        e.preventDefault();  // Prevent the default behavior (navigation)
        

        
        if (confirmLogout) {
            // Perform logout action here (e.g., clear session or token, redirect, etc.)
            // For example, if using localStorage for a token:
            localStorage.removeItem("authToken");
            window.location.href = "/login";  // Redirect to login page after logout
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">WanderWise</Link>
                <ul className="navbar-menu">
                    <li><Link to="/" className="navbar-item">Home</Link></li>
                    <li><Link to="/about" className="navbar-item">About</Link></li>
                    <li><Link to="/services" className="navbar-item">Services</Link></li>
                    <li><Link to="/contact" className="navbar-item">Contact</Link></li>
                    <li><Link to="/login" className="navbar-item">Login</Link></li>
                   
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
