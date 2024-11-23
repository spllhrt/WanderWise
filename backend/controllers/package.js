const Package = require('../models/package');
const Category = require('../models/category');
const cloudinary = require('cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// Controller for fetching packages
exports.getPackages = async (req, res) => {
    try {
        const resPerPage = 4;
        const apiFeatures = new APIFeatures(Package.find(), req.query)
            .search()
            .filter()
            .pagination(resPerPage);

        const packages = await apiFeatures.query;
        const packagesCount = await Package.countDocuments();

        res.status(200).json({
            success: true,
            packages,
            resPerPage,
            packagesCount
        });
    } catch (error) {
        console.error("Error fetching packages:", error); // Detailed error logging
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a single package by ID
exports.getSinglePackage = async (req, res) => {
    const package = await Package.findById(req.params.id).populate('category');
    if (!package) {
        return res.status(404).json({
            success: false,
            message: 'Package not found'
        });
    }
    return res.status(200).json({
        success: true,
        package
    });
};

// Get all packages for admins
exports.getAdminPackages = async (req, res) => {
    const packages = await Package.find().populate('category');
    if (!packages) {
        return res.status(404).json({
            success: false,
            message: 'Packages not found'
        });
    }
    return res.status(200).json({
        success: true,
        packages
    });
};

// Delete a package by ID
exports.deletePackage = async (req, res) => {
    const package = await Package.findById(req.params.id);
    if (!package) {
        return res.status(404).json({
            success: false,
            message: 'Package not found'
        });
    }

    // Delete all associated images from Cloudinary
    for (const image of package.images) {
        await cloudinary.uploader.destroy(image.public_id);
    }

    // Use deleteOne() instead of remove()
    await Package.deleteOne({ _id: req.params.id });

    return res.status(200).json({
        success: true,
        message: 'Package deleted'
    });
};


// Create a new package
exports.newPackage = async (req, res) => {
    let images = req.files || [];
    let imagesLinks = [];

    // Upload each image to Cloudinary
    for (let i = 0; i < images.length; i++) {
        try {
            const result = await cloudinary.uploader.upload(images[i].path, {
                folder: 'packages',
                width: 150,
                crop: 'scale',
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading image to Cloudinary',
                error: error.message,
            });
        }
    }

    req.body.images = imagesLinks;

    const package = await Package.create(req.body);

    if (!package) {
        return res.status(400).json({
            success: false,
            message: 'Package not created'
        });
    }

    return res.status(201).json({
        success: true,
        package
    });
};

// Update an existing package
exports.updatePackage = async (req, res) => {
    try {
        let package = await Package.findById(req.params.id);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found',
            });
        }

        // Validate category ID if it's being updated
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID',
                });
            }
            package.category = req.body.category; // Assign valid category ID
        }

        // Other updates
        if (req.body.name) package.name = req.body.name;
        if (req.body.description) package.description = req.body.description;
        if (req.body.price) package.price = req.body.price;
        if (req.body.locations) package.locations = req.body.locations;
        if (req.body.features) package.features = req.body.features;
        if (req.body.itinerary) package.itinerary = req.body.itinerary;
        if (req.body.status) package.status = req.body.status;

        let imagesLinks = [];

        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const image of package.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }

            // Upload new images to Cloudinary
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'packages',
                    width: 150,
                    crop: 'scale',
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        } else {
            imagesLinks = package.images; // Keep the old images if no new images are uploaded
        }

        package.images = imagesLinks;

        await package.save();

        return res.status(200).json({
            success: true,
            package,
        });
    } catch (error) {
        console.error('Update package error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};