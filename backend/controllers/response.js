const Response = require('../models/response');
const APIFeatures = require('../utils/apiFeatures');

// Get all responses with pagination and filtering
exports.getResponses = async (req, res) => {
    const resPerPage = 4;
    const responsesCount = await Response.countDocuments();
    const apiFeatures = new APIFeatures(Response.find(), req.query).filter();
    apiFeatures.pagination(resPerPage);
    
    const responses = await apiFeatures.query;

    if (!responses || responses.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No responses found',
            responses: [],
            filteredResponseCount: 0,
            resPerPage,
            responsesCount,
        });
    }

    let filteredResponseCount = responses.length;

    return res.status(200).json({
        success: true,
        responses,
        filteredResponseCount,
        resPerPage,
        responsesCount,
    });
};

// Get a single response by ID
exports.getSingleResponse = async (req, res) => {
    try {
        const response = await Response.findById(req.params.id);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Response not found',
            });
        }
        return res.status(200).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('Error fetching response:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// Create a new response
exports.createResponse = async (req, res) => {
    const { reviewId, userId, comments } = req.body;

    try {
        const response = await Response.create({
            reviewId,
            userId,
            comments,
        });

        return res.status(201).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('Error creating response:', error);
        return res.status(400).json({
            success: false,
            message: 'Response not created',
            error: error.message, // Optional: Include error message for debugging
        });
    }
};

// Update an existing response
exports.updateResponse = async (req, res) => {
    try {
        const response = await Response.findById(req.params.id);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Response not found',
            });
        }

        // Update fields if provided
        response.comments = req.body.comments || response.comments;
        response.userId = req.body.userId || response.userId; // Update userId if provided

        await response.save();

        return res.status(200).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('Error updating response:', error);
        return res.status(400).json({
            success: false,
            message: 'Response not updated',
            error: error.message,
        });
    }
};

// Delete a response
exports.deleteResponse = async (req, res) => {
    try {
        const response = await Response.findByIdAndDelete(req.params.id);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: 'Response not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Response deleted',
        });
    } catch (error) {
        console.error('Error deleting response:', error);
        return res.status(400).json({
            success: false,
            message: 'Response not deleted',
            error: error.message,
        });
    }
};
