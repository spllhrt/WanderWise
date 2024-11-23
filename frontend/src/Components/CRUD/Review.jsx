import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData';
import { getUser, logout } from '../../utils/helpers';
import 'bootstrap/dist/css/bootstrap.min.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [review, setReview] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    // Check if the user is logged in and has the 'admin' role
    const user = getUser();
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('You must be logged in as an admin to view reviews');
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/reviews');
                setReviews(res.data.reviews);
                setLoading(false);
            } catch (err) {
                setError('Error loading reviews');
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        if (id) {
            fetchReviewDetails(id);
        }
    }, [id]);

    const fetchReviewDetails = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/review/${id}`);
            setReview(res.data.review);
            setViewMode(false);
            setModalShow(true);
        } catch (err) {
            setError('Review not found');
        }
    };

    const handleDeleteReview = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/review/${id}`);
            setReviews(reviews.filter(r => r._id !== id));
            toast.success('Review deleted successfully');
        } catch (err) {
            setError('Error deleting review');
        }
    };

    const handleViewReview = (rev) => {
        setReview(rev);
        setViewMode(true);
        setModalShow(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <MetaData title="Reviews" />
            <div className="container mt-5">
                <h1 className="mb-4">Reviews</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">User ID</th>
                            <th scope="col">Comments</th>
                            <th scope="col">Image</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(rev => (
                            <tr key={rev._id}>
                                <td>{rev.userID}</td>
                                <td>{rev.comments}</td>
                                <td>
                                    {rev.images[0] && (
                                        <img src={rev.images[0].url} alt="Review" style={{ width: '100px', height: '100px' }} />
                                    )}
                                </td>
                                <td>
                                    <button className="btn btn-info mr-2" onClick={() => handleViewReview(rev)}>View</button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteReview(rev._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Reviews;
