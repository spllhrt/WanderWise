import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from "mui-datatables";
import MetaData from '../Layout/MetaData';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState({});
    const [newPackage, setNewPackage] = useState({
        name: '',
        description: '',
        price: '',
        features: '',
        status: 'Available',
        category: '',
        images: [],
        itinerary: ''  
    });
    const [updateMode, setUpdateMode] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
        const fetchPackages = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/packages');
                setPackages(res.data.packages);
            } catch (err) {
                toast.error('Error loading packages');
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/categories');
                setCategories(res.data.categories);
            } catch (err) {
                toast.error('Error loading categories');
            }
        };

        fetchPackages();
        fetchCategories();
    }, []);

    const handleNewPackage = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newPackage.name);
        formData.append('description', newPackage.description);
        formData.append('price', newPackage.price);
        formData.append('features', newPackage.features);
        formData.append('status', newPackage.status);
        formData.append('category', newPackage.category); // Send the category _id
        formData.append('itinerary', newPackage.itinerary); // Send itinerary field

        newPackage.images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            const res = await axios.post('http://localhost:5000/api/admin/package/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPackages([...packages, res.data.package]);
            toast.success('Package created successfully');
            setNewPackage({
                name: '',
                description: '',
                price: '',
                features: '',
                status: 'Available',
                category: '',
                images: [],
                itinerary: '' // Reset itinerary field
            });
            setModalShow(false);
        } catch (err) {
            toast.error('Error creating package');
        }
    };

    const handleUpdatePackage = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', selectedPackage.name);
        formData.append('description', selectedPackage.description);
        formData.append('price', selectedPackage.price);
        formData.append('features', selectedPackage.features);
        formData.append('status', selectedPackage.status);
        formData.append('category', selectedPackage.category); // Send the category _id
        formData.append('itinerary', selectedPackage.itinerary); // Send itinerary field

        if (selectedPackage.images) {
            selectedPackage.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/admin/package/${selectedPackage._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPackages(packages.map(pkg => (pkg._id === res.data.package._id ? res.data.package : pkg)));
            toast.success('Package updated successfully');
            setUpdateMode(false);
            setSelectedPackage({});
            setModalShow(false);
        } catch (err) {
            toast.error('Error updating package');
        }
    };

    const handleEditPackage = (id) => {
        const selectedPkg = packages.find(pkg => pkg._id === id);
        if (selectedPkg) {
            setSelectedPackage(selectedPkg);
            setUpdateMode(true);
            setModalShow(true);
        }
    };

    const handleDeletePackage = async (rowsDeleted) => {
        try {
            const idsToDelete = rowsDeleted.data.map(row => packages[row.dataIndex]._id);
            await Promise.all(idsToDelete.map(id => axios.delete(`http://localhost:5000/api/admin/package/${id}`)));
            setPackages(packages.filter(pkg => !idsToDelete.includes(pkg._id)));
            toast.success('Selected packages deleted successfully');
        } catch (err) {
            toast.error('Error deleting packages');
        }
    };

    const columns = [
        { name: "name", label: "Package Name" },
        { 
            name: "images", 
            label: "Images",
            options: {
                customBodyRender: (images) => (
                    images.map((img, index) => (
                        <img key={index} src={img.url} alt="package" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                    ))
                )
            }
        },
        { name: "description", label: "Description" },
        { name: "price", label: "Price" },
        {
            name: "status", 
            label: "Status",
            options: {
                customBodyRender: (status) => <span>{status}</span>
            }
        },
        {
            name: "category",
            label: "Category",
            options: {
                customBodyRender: (category) => {
                    return category ? category.name : 'N/A';
                }
            }
        },
        
        {
            name: "edit",
            label: "Edit",
            options: {
                customBodyRender: (_, tableMeta) => (
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditPackage(packages[tableMeta.rowIndex]._id)}
                    >
                        Edit
                    </button>
                )
            }
        }
    ];

    const options = {
        filter: false,
        selectableRows: "multiple",
        onRowSelectionChange: (currentRowsSelected, allRowsSelected) => {
            const ids = allRowsSelected.map(row => packages[row.dataIndex]._id);
        },
        onRowsDelete: handleDeletePackage,
    };

    return (
        <>
            <MetaData title="Packages" />
            <div className="container mt-5">
                <h1 className="mb-4">Packages</h1>
                <button className="btn btn-primary mb-4" onClick={() => { setNewPackage({ name: '', description: '', price: '', features: '', status: 'Available', category: '', images: [], itinerary: '' }); setUpdateMode(false); setModalShow(true); }}>
                    Add New Package
                </button>
                <MUIDataTable
                    title={"Package List"}
                    data={packages}
                    columns={columns}
                    options={options}
                />

                {/* Modal for Add/Edit Package */}
                {modalShow && (
                    <div className={`modal fade show`} style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{updateMode ? 'Edit Package' : 'Add New Package'}</h5>
                                    <button type="button" className="close" onClick={() => setModalShow(false)} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={updateMode ? handleUpdatePackage : handleNewPackage}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={updateMode ? selectedPackage.name : newPackage.name}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, name: e.target.value }) : setNewPackage({ ...newPackage, name: e.target.value })}
                                                placeholder="Package Name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                className="form-control"
                                                value={updateMode ? selectedPackage.description : newPackage.description}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, description: e.target.value }) : setNewPackage({ ...newPackage, description: e.target.value })}
                                                placeholder="Description"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={updateMode ? selectedPackage.price : newPackage.price}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, price: e.target.value }) : setNewPackage({ ...newPackage, price: e.target.value })}
                                                placeholder="Price"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                className="form-control"
                                                value={updateMode ? selectedPackage.features : newPackage.features}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, features: e.target.value }) : setNewPackage({ ...newPackage, features: e.target.value })}
                                                placeholder="Features"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="file"
                                                className="form-control"
                                                multiple
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, images: [...selectedPackage.images, ...e.target.files] }) : setNewPackage({ ...newPackage, images: [...newPackage.images, ...e.target.files] })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <select
                                                className="form-control"
                                                value={updateMode ? selectedPackage.category : newPackage.category}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, category: e.target.value }) : setNewPackage({ ...newPackage, category: e.target.value })}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>{category.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                className="form-control"
                                                value={updateMode ? selectedPackage.itinerary : newPackage.itinerary}
                                                onChange={(e) => updateMode ? setSelectedPackage({ ...selectedPackage, itinerary: e.target.value }) : setNewPackage({ ...newPackage, itinerary: e.target.value })}
                                                placeholder="Itinerary"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary">{updateMode ? 'Update' : 'Create'} Package</button>
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

export default Packages;
