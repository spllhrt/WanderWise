import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData';
import { getUser } from '../../utils/helpers';
import 'bootstrap/dist/css/bootstrap.min.css';
import MUIDataTable from "mui-datatables";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

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
            setViewMode(true);
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

    const handleCloseModal = () => {
        setModalShow(false);
    };

    // Function to render stars based on rating
    const renderStars = (rating) => {
        const filledStars = '★'.repeat(rating); // Create string of filled stars
        const emptyStars = '☆'.repeat(5 - rating); // Create string of empty stars (assuming max 5 stars)
        return filledStars + emptyStars; // Combine filled and empty stars
    };

    // Data columns for MUI DataTables
    const columns = [
        { name: "userID", label: "User ID", options: { filter: true, sort: true } },
        { name: "comments", label: "Comments", options: { filter: true, sort: true } },
        {
            name: "actions",
            label: "Actions",
            options: {
                customBodyRender: (value, tableMeta) => {
                    const reviewId = reviews[tableMeta.rowIndex]._id;
                    return (
                        <>
                            <button className="btn btn-info mr-2" onClick={() => handleViewReview(reviews[tableMeta.rowIndex])}>View</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteReview(reviewId)}>Delete</button>
                        </>
                    );
                }
            }
        }
    ];

    const options = {
        filterType: 'checkbox',
        responsive: 'standard',
        selectableRows: 'none',
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <MetaData title="Reviews" />
            <div className="container mt-5">
                <h1 className="mb-4">Reviews</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <MUIDataTable
                    title={"Reviews List"}
                    data={reviews}
                    columns={columns}
                    options={options}
                />

                {/* Modal for Viewing Review Details */}
                <Dialog open={modalShow} onClose={handleCloseModal}>
                    <DialogTitle>Review Details</DialogTitle>
                    <DialogContent>
                        <div>
                            <h4>User ID: {review.userID}</h4>
                            <p><strong>Comments:</strong> {review.comments}</p>
                            <p><strong>Rating:</strong> {review.ratings ? renderStars(review.ratings) : 'No rating provided'}</p>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default Reviews;
