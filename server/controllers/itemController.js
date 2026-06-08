const StolenItem = require('../models/StolenItem');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all stolen items
 * @route   GET /api/items/stolen
 * @access  Private (Officer/Admin)
 */
const getStolenItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'stolen' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await StolenItem.find(query)
      .sort({ createdAt: -1 })
      .populate('complaintId', 'complaintNumber title reporterName');

    return sendSuccess(res, items, 'Stolen items inventory retrieved successfully');
  } catch (error) {
    console.error('Fetch stolen items error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get all recovered items
 * @route   GET /api/items/recovered
 * @access  Private (Officer/Admin)
 */
const getRecoveredItems = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'recovered' };

    if (category) {
      query.category = category;
    }

    const items = await StolenItem.find(query)
      .sort({ recoveredDate: -1 })
      .populate('complaintId', 'complaintNumber title reporterName');

    return sendSuccess(res, items, 'Recovered items inventory retrieved successfully');
  } catch (error) {
    console.error('Fetch recovered items error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get single item details by ID
 * @route   GET /api/items/:id
 * @access  Private
 */
const getItemById = async (req, res) => {
  try {
    const item = await StolenItem.findById(req.params.id)
      .populate('complaintId');
      
    if (!item) {
      return sendError(res, 'Item not found in database', 404);
    }
    
    return sendSuccess(res, item, 'Item details retrieved successfully');
  } catch (error) {
    console.error('Fetch item by ID error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Mark an item as recovered manually
 * @route   PUT /api/items/:id/recover
 * @access  Private (Officer/Admin)
 */
const updateItemRecovery = async (req, res) => {
  try {
    const { recoveryLocation } = req.body;
    
    if (!recoveryLocation) {
      return sendError(res, 'Please provide the recovery location details', 400);
    }

    const item = await StolenItem.findById(req.params.id);
    if (!item) {
      return sendError(res, 'Item not found in database', 404);
    }

    if (item.status === 'recovered') {
      return sendError(res, 'Item has already been marked as recovered', 400);
    }

    item.status = 'recovered';
    item.recoveryLocation = recoveryLocation;
    item.recoveredDate = new Date();
    
    await item.save(); // Triggers Mongoose post-save hooks to resolve complaint if applicable

    return sendSuccess(res, item, 'Item status updated to RECOVERED successfully');
  } catch (error) {
    console.error('Recover item error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getStolenItems,
  getRecoveredItems,
  getItemById,
  updateItemRecovery
};
