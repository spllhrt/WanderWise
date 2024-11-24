import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from "mui-datatables";
import MetaData from '../Layout/MetaData';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loggedUser, setLoggedUser] = useState(null); // Logged-in user state
    const [updateMode, setUpdateMode] = useState(false); // Update mode state
    const [booking, setBooking] = useState({}); // Current booking being edited
    const [modalShow, setModalShow] = useState(false); // Modal visibility state
    const navigate = useNavigate();

    // Fetch bookings and user details on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/bookings');
                console.log("Fetched Bookings:", res.data.bookings); // Debugging
                setBookings(res.data.bookings);
            } catch (err) {
                console.error("Error loading bookings:", err);
                toast.error('Error loading bookings');
            }
        };

        fetchBookings();

        // Fetch logged-in user details
        const user = JSON.parse(localStorage.getItem('loggedUser')); // Assume user is stored in localStorage
        if (user) {
            setLoggedUser(user);
        }
    }, []);

    // Handle delete bookings
    const handleDeleteBookings = async (rowsDeleted) => {
        try {
            const idsToDelete = rowsDeleted.data.map(row => bookings[row.dataIndex]._id);
            await Promise.all(idsToDelete.map(id => axios.delete(`http://localhost:5000/api/admin/booking/${id}`)));
            setBookings(bookings.filter(booking => !idsToDelete.includes(booking._id)));
            toast.success('Selected bookings deleted successfully');
        } catch (err) {
            console.error("Error deleting bookings:", err);
            toast.error('Error deleting bookings');
        }
    };

    // Open the edit modal and set the selected booking
    const handleEditBooking = (id) => {
        const selectedBooking = bookings.find(booking => booking._id === id);
        if (selectedBooking) {
            setBooking(selectedBooking);
            setUpdateMode(true);
            setModalShow(true);
        }
    };

    // Handle updating a booking
    const handleUpdateBooking = async (e) => {
      e.preventDefault();
  
      try {
          const updatedStatus = booking.bookingStatus; // Use the bookingStatus from the form
          const res = await axios.put(
              `http://localhost:5000/api/admin/booking/${booking._id}`,
              { bookingStatus: updatedStatus } // Send the correct field name
          );
  
          console.log("Updated Booking Response:", res.data); // Debugging
  
          // Update the local state with the updated booking
          setBookings((prevBookings) =>
              prevBookings.map((bk) =>
                  bk._id === res.data.booking._id ? res.data.booking : bk
              )
          );
  
          toast.success("Booking status updated successfully");
          setUpdateMode(false);
          setBooking({});
          setModalShow(false);
      } catch (err) {
          console.error("Error updating booking:", err);
          toast.error("Error updating booking");
      }
  };
  
  
  

    // Columns for MUI DataTable
    const columns = [
        { name: "user", label: "User" },
        { name: "packageId", label: "Package" },
        { name: "travelDates", label: "Travel Dates" },
        { name: "numberOfTravelers", label: "Number of Travelers" },
        { name: "packagePrice", label: "Package Price" },
        { name: "totalPrice", label: "Total Price" },
        { name: "bookingStatus", label: "Booking Status" },
        { name: "createdAt", label: "Created At" },
        {
            name: "edit",
            label: "Edit",
            options: {
                customBodyRender: (_, tableMeta) => (
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditBooking(bookings[tableMeta.rowIndex]._id)}
                    >
                        Edit
                    </button>
                ),
            },
        },
    ];

    const options = {
        filter: false,
        selectableRows: "multiple",
        onRowsDelete: handleDeleteBookings,
    };

    return (
        <>
            <MetaData title="Bookings" />
            <div className="container mt-5">
                <h1 className="mb-4">Bookings</h1>
                {loggedUser && (
                    <div>
                        <p>Welcome, {loggedUser.username}</p>
                    </div>
                )}
                <MUIDataTable
                    title={"Bookings List"}
                    data={bookings.map(booking => [
                        booking.user ? booking.user.name : 'N/A',
                        booking.packageId ? booking.packageId.name : 'N/A',
                        new Date(booking.travelDates).toLocaleDateString(),
                        booking.numberOfTravelers,
                        booking.packagePrice,
                        booking.totalPrice,
                        booking.bookingStatus,
                        new Date(booking.createdAt).toLocaleDateString(),
                    ])}
                    columns={columns}
                    options={options}
                />

                {/* Modal for Edit Booking */}
                {modalShow && (
                    <div className={`modal fade show`} style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Booking</h5>
                                    <button type="button" className="close" onClick={() => setModalShow(false)} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateBooking}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Travel Dates</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={booking.travelDates ? booking.travelDates.split('T')[0] : ''}
                                                onChange={(e) => setBooking({ ...booking, travelDates: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Number of Travelers</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={booking.numberOfTravelers}
                                                onChange={(e) => setBooking({ ...booking, numberOfTravelers: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                          <label>Booking Status</label>
                                          <select
                                              className="form-control"
                                              value={booking.bookingStatus}
                                              onChange={(e) => setBooking({ ...booking, bookingStatus: e.target.value })}
                                              required
                                          >
                                              <option value="pending">Pending</option>
                                              <option value="confirmed">Confirmed</option>
                                              <option value="canceled">Canceled</option>
                                              <option value="processing">Processing</option>
                                              <option value="success">Success</option>
                                          </select>
                                      </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary">Update Booking</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Bookings;
