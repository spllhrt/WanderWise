const Category = require('../models/category');
const cloudinary = require('cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// In controllers/category.js

exports.getCategories = async (req, res) => {
    try {
      const categories = await Category.find(); // Fetch all categories from the database
      res.status(200).json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


exports.getSingleCategory = async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    return res.status(200).json({
        success: true,
        category
    });
};

exports.getAdminCategories = async (req, res, next) => {
    const categories = await Category.find();
    if (!categories) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    return res.status(200).json({
        success: true,
        categories
    });
};

exports.deleteCategory = async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }

    // Delete all associated images from Cloudinary
    for (const image of category.images) {
        await cloudinary.uploader.destroy(image.public_id);
    }

    await category.remove();

    return res.status(200).json({
        success: true,
        message: 'Category deleted'
    });
};

exports.newCategory = async (req, res, next) => {
    let images = req.files || [];

    let imagesLinks = [];

    // Upload each image to Cloudinary
    for (let i = 0; i < images.length; i++) {
        try {
            const result = await cloudinary.uploader.upload(images[i].path, {
                folder: 'categories', 
                width: 150,
                crop: "scale",
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

    const category = await Category.create(req.body);

    if (!category) {
        return res.status(400).json({
            success: false,
            message: 'Category not created'
        });
    }

    return res.status(201).json({
        success: true,
        category
    });
};

exports.updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        if (req.body.name) {
            category.name = req.body.name;
        }

        let imagesLinks = [];

        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const image of category.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }

            // Upload new images to Cloudinary
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'categories',
                    width: 150,
                    crop: "scale",
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        } else {
            imagesLinks = category.images; // Keep the old images if no new images are uploaded
        }

        category.images = imagesLinks;

        await category.save();

        return res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error('Update category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};