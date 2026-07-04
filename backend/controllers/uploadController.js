import { uploadToCloudinary } from '../config/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles single image upload to Cloudinary.
 * Exposes a POST endpoint.
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image file to upload.');
  }

  // Choose subfolder based on request body or default to general uploads
  const type = req.body.type || 'general'; // values: 'food', 'restaurant', 'profile', 'general'
  const folder = `flavordash/${type}`;

  try {
    const result = await uploadToCloudinary(req.file.buffer, folder);
    
    res.status(200).json(
      new ApiResponse(200, {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format
      }, 'Image uploaded successfully')
    );
  } catch (error) {
    console.error(`Cloudinary upload failed: ${error.message}`);
    throw new ApiError(500, `Image upload failed: ${error.message}`);
  }
});
