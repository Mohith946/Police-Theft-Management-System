const Criminal = require('../models/Criminal');
const MatchResult = require('../models/MatchResult');
const { runMatchingForCriminal } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all criminals / search suspects
 * @route   GET /api/criminals
 * @access  Private (Officer/Admin)
 */
const getCriminals = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } },
        { 'physicalFeatures.scars': { $regex: search, $options: 'i' } },
        { 'physicalFeatures.tattoos': { $regex: search, $options: 'i' } }
      ];
    }

    const criminals = await Criminal.find(query).sort({ name: 1 });
    return sendSuccess(res, criminals, 'Criminal records retrieved successfully');
  } catch (error) {
    console.error('Fetch criminals error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get single criminal by ID
 * @route   GET /api/criminals/:id
 * @access  Private (Officer/Admin)
 */
const getCriminalById = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);
    if (!criminal) {
      return sendError(res, 'Suspect record not found', 404);
    }
    return sendSuccess(res, criminal, 'Suspect profile retrieved successfully');
  } catch (error) {
    console.error('Fetch suspect by ID error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Add new criminal profile
 * @route   POST /api/criminals
 * @access  Private (Officer/Admin)
 */
const createCriminal = async (req, res) => {
  try {
    const {
      name,
      aliases,
      dateOfBirth,
      gender,
      height,
      weight,
      hairColor,
      eyeColor,
      scars,
      tattoos,
      lastKnownLocation,
      status
    } = req.body;

    if (!name || !gender || !lastKnownLocation) {
      return sendError(res, 'Missing required fields: name, gender, lastKnownLocation', 400);
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/criminals/${req.file.filename}`;
    }

    // Assemble physical features
    const physicalFeatures = {
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
      hairColor,
      eyeColor,
      scars: scars || 'none',
      tattoos: tattoos || 'none'
    };

    const criminal = await Criminal.create({
      name,
      aliases,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      physicalFeatures,
      lastKnownLocation,
      photoUrl,
      status: status || 'active'
    });

    console.log(`[CriminalController] Profile created: ${criminal.name}. Running background matches...`);
    // Run matches in background
    runMatchingForCriminal(criminal).catch(err => {
      console.error('[Background Matching Error] Failed for suspect:', err);
    });

    return sendSuccess(res, criminal, 'Criminal record created successfully', 201);
  } catch (error) {
    console.error('Create criminal profile error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update criminal profile
 * @route   PUT /api/criminals/:id
 * @access  Private (Officer/Admin)
 */
const updateCriminal = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);
    if (!criminal) {
      return sendError(res, 'Suspect record not found', 404);
    }

    const {
      name,
      aliases,
      dateOfBirth,
      gender,
      height,
      weight,
      hairColor,
      eyeColor,
      scars,
      tattoos,
      lastKnownLocation,
      status
    } = req.body;

    if (name) criminal.name = name;
    if (aliases !== undefined) criminal.aliases = aliases;
    if (dateOfBirth) criminal.dateOfBirth = new Date(dateOfBirth);
    if (gender) criminal.gender = gender;
    if (status) criminal.status = status;
    if (lastKnownLocation) criminal.lastKnownLocation = lastKnownLocation;

    if (height || weight || hairColor || eyeColor || scars || tattoos) {
      criminal.physicalFeatures = {
        ...criminal.physicalFeatures,
        ...(height && { height: parseInt(height) }),
        ...(weight && { weight: parseInt(weight) }),
        ...(hairColor && { hairColor }),
        ...(eyeColor && { eyeColor }),
        ...(scars !== undefined && { scars }),
        ...(tattoos !== undefined && { tattoos })
      };
    }

    if (req.file) {
      criminal.photoUrl = `/uploads/criminals/${req.file.filename}`;
    }

    await criminal.save();

    console.log(`[CriminalController] Profile updated: ${criminal.name}. Re-running matches...`);
    // Re-evaluate matches in background
    runMatchingForCriminal(criminal).catch(err => {
      console.error('[Background Matching Error] Failed during update:', err);
    });

    return sendSuccess(res, criminal, 'Criminal record updated successfully');
  } catch (error) {
    console.error('Update criminal profile error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete criminal profile
 * @route   DELETE /api/criminals/:id
 * @access  Private (Admin)
 */
const deleteCriminal = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);
    if (!criminal) {
      return sendError(res, 'Suspect record not found', 404);
    }

    // Cascade delete associated match results
    await MatchResult.deleteMany({ criminalId: criminal._id });

    await criminal.deleteOne();
    return sendSuccess(res, null, 'Criminal record and associated matches deleted successfully');
  } catch (error) {
    console.error('Delete criminal profile error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getCriminals,
  getCriminalById,
  createCriminal,
  updateCriminal,
  deleteCriminal
};
