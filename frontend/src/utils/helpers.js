import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Save authentication data to session storage
export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', JSON.stringify(data.token));
        sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    next();
};

// Retrieve token from session storage
export const getToken = () => {
    if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('token')) {
            return JSON.parse(sessionStorage.getItem('token'));
        } else {
            return false;
        }
    }
};

// Retrieve user data from session storage
export const getUser = () => {
    if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('user')) {
            return JSON.parse(sessionStorage.getItem('user'));
        } else {
            return false;
        }
    }
};

// Logout function: Remove session storage data and trigger a callback
export const logout = (next) => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }
    next(); // Callback to perform actions after logout
};

// Display error message
export const errMsg = (message = '') =>
    toast.error(message, {
        position: 'bottom-right',
    });

// Display success message
export const successMsg = (message = '') =>
    toast.success(message, {
        position: 'bottom-right',
    });
