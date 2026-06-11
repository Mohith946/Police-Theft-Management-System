const Complaint = require('../models/Complaint');
const StolenItem = require('../models/StolenItem');
const MatchResult = require('../models/MatchResult');
const { generateUniqueToken, generateComplaintToken } = require('../services/qrService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all complaints (Citizens see only their own; Officers/Admins see all)
 * @route   GET /api/complaints
 * @access  Private
 */
const getComplaints = async (req, res) => {
  try {
    let query = {};
    
    // Enforce role visibility constraints
    if (req.user.role === 'citizen') {
      query.reportedBy = req.user._id;
    }

    const { status, category } = req.query;
    if (status) query.status = status;
    if (category) query.category = category;

    // Fetch complaints and populate reporter user details
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'username email');

    return sendSuccess(res, complaints, 'Complaints retrieved successfully');
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get a single complaint with its associated stolen items
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'username email');

    if (!complaint) {
      return sendError(res, 'Complaint record not found', 404);
    }

    // Role check: Citizen cannot view other people's complaints
    if (req.user.role === 'citizen' && complaint.reportedBy && complaint.reportedBy._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied: You cannot view this complaint details', 403);
    }

    // Find and populate related stolen items
    const items = await StolenItem.find({ complaintId: complaint._id });

    return sendSuccess(res, { complaint, items }, 'Complaint details retrieved successfully');
  } catch (error) {
    console.error('Fetch complaint by ID error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    File a new complaint with its stolen items
 * @route   POST /api/complaints
 * @access  Private
 */
const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      theftDate,
      theftLocation,
      reporterName,
      reporterContact,
      scenePhotos,
      audioStatement,
      items // Array of items: [{ itemName, description, serialNumber, estimatedValue }]
    } = req.body;

    if (!title || !description || !category || !theftDate || !theftLocation || !reporterName) {
      return sendError(res, 'Missing required fields for filing a complaint', 400);
    }

    // Generate unique complaint number (Format: COMP-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    const complaintNumber = `COMP-${dateStr}-${randStr}`;

    // Generate unique complaint QR token
    const complaintToken = generateComplaintToken();

    // Handle scenePhotos: upload base64 files to Uploadthing
    const uploadedPhotoUrls = [];
    if (scenePhotos && Array.isArray(scenePhotos) && scenePhotos.length > 0) {
      try {
        const { UTApi } = require('uploadthing/server');
        const utapi = new UTApi({
          token: process.env.UPLOADTHING_TOKEN
        });

        for (let i = 0; i < scenePhotos.length; i++) {
          const photo = scenePhotos[i];
          if (photo.startsWith('data:image/')) {
            try {
              const matches = photo.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
              if (matches && matches.length >= 3) {
                const ext = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                
                const filename = `complaint_photo_${Date.now()}_${i}.${ext}`;
                const file = new File([buffer], filename, { type: `image/${ext}` });
                
                console.log(`[UploadThing] Uploading ${filename} to Uploadthing...`);
                const uploadResponse = await utapi.uploadFiles([file]);
                
                if (uploadResponse && uploadResponse[0] && uploadResponse[0].data) {
                  const url = uploadResponse[0].data.ufsUrl || uploadResponse[0].data.url;
                  console.log(`[UploadThing] Uploaded successfully: ${url}`);
                  uploadedPhotoUrls.push(url);
                } else {
                  console.error(`[UploadThing Error] Failed upload for index ${i}:`, uploadResponse[0]?.error);
                  uploadedPhotoUrls.push(photo);
                }
              } else {
                uploadedPhotoUrls.push(photo);
              }
            } catch (err) {
              console.error(`[UploadThing Error] Exception on photo index ${i}:`, err);
              uploadedPhotoUrls.push(photo);
            }
          } else {
            uploadedPhotoUrls.push(photo);
          }
        }
      } catch (err) {
        console.error('[UploadThing Init Error] Failed to initialize UTApi or upload files:', err);
        uploadedPhotoUrls.push(...scenePhotos);
      }
    } else {
      uploadedPhotoUrls.push(...(scenePhotos || []));
    }

    // Create the complaint
    const complaint = await Complaint.create({
      complaintNumber,
      title,
      description,
      category,
      theftDate: new Date(theftDate),
      theftLocation,
      reportedBy: req.user._id,
      reporterName,
      reporterContact: reporterContact || '',
      qrCodeToken: complaintToken,
      scenePhotos: uploadedPhotoUrls,
      audioStatement: audioStatement || null,
      status: 'pending'
    });

    const createdItems = [];
    
    // Save associated stolen items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qrCodeToken = generateUniqueToken();
        const newItem = await StolenItem.create({
          complaintId: complaint._id,
          itemName: item.itemName,
          category: item.category || category, // Fallback to complaint category
          description: item.description || '',
          serialNumber: item.serialNumber || '',
          estimatedValue: item.estimatedValue ? parseFloat(item.estimatedValue) : 0,
          qrCodeToken,
          status: 'stolen'
        });
        createdItems.push(newItem);
      }
    }

    return sendSuccess(res, { complaint, items: createdItems }, 'Complaint lodged and registered successfully', 201);
  } catch (error) {
    console.error('Lodge complaint error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update complaint details
 * @route   PUT /api/complaints/:id
 * @access  Private (Officer/Admin)
 */
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint record not found', 404);
    }

    const { title, description, category, theftDate, theftLocation, status, caughtSuspect } = req.body;

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (theftDate) complaint.theftDate = new Date(theftDate);
    if (theftLocation) complaint.theftLocation = theftLocation;
    if (status) complaint.status = status;

    await complaint.save();

    // If status is resolved and caughtSuspect details are provided, create the Criminal record
    if (status === 'resolved' && caughtSuspect && caughtSuspect.name) {
      const Criminal = require('../models/Criminal');
      const MatchResult = require('../models/MatchResult');

      const { name, aliases, gender, lastKnownLocation, physicalFeatures } = caughtSuspect;

      const criminal = await Criminal.create({
        name,
        aliases: aliases || '',
        gender: gender || 'other',
        lastKnownLocation: lastKnownLocation || complaint.theftLocation,
        physicalFeatures: {
          height: physicalFeatures?.height ? parseInt(physicalFeatures.height) : undefined,
          weight: physicalFeatures?.weight ? parseInt(physicalFeatures.weight) : undefined,
          hairColor: physicalFeatures?.hairColor || 'unknown',
          eyeColor: physicalFeatures?.eyeColor || 'unknown',
          scars: physicalFeatures?.scars || 'none',
          tattoos: physicalFeatures?.tattoos || 'none'
        },
        status: 'incarcerated' // caught!
      });

      // Create a verified MatchResult to connect this criminal and complaint case
      await MatchResult.findOneAndUpdate(
        { complaintId: complaint._id, criminalId: criminal._id },
        {
          matchScore: 100,
          matchReason: 'Perpetrator caught and arrested during active case investigation.',
          status: 'verified'
        },
        { upsert: true, new: true }
      );
    }

    return sendSuccess(res, complaint, 'Complaint updated successfully');
  } catch (error) {
    console.error('Update complaint error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete a complaint
 * @route   DELETE /api/complaints/:id
 * @access  Private (Admin)
 */
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint record not found', 404);
    }

    // Cascade delete associated stolen items and match results
    await StolenItem.deleteMany({ complaintId: complaint._id });
    await MatchResult.deleteMany({ complaintId: complaint._id });

    await complaint.deleteOne();
    return sendSuccess(res, null, 'Complaint record and associated items/matches deleted successfully');
  } catch (error) {
    console.error('Delete complaint error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint
};
