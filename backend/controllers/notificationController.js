import NotificationRepository from '../repositories/NotificationRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationRepository.findByUserId(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { notifications }, 'Notifications retrieved successfully')
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await NotificationRepository.markAsRead(id, req.user._id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found or access denied');
  }

  res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification marked as read successfully')
  );
});
export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationRepository.updateOne(
    { user: req.user._id, read: false },
    { read: true },
    { multi: true }
  );

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications marked as read')
  );
});
