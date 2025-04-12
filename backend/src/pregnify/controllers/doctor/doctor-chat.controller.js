import { doctorChatService } from '../../services/doctor/doctor-chat.service.js';
import { catchAsync } from '../../utils/catch-async.js';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../utils/ApiError.js';

const prisma = new PrismaClient();

/**
 * Send a message to a patient
 * @route POST /api/v1/doctor/chats
 * @access Private
 */
export const sendMessage = catchAsync(async (req, res) => {
  const message = await doctorChatService.sendMessage(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    data: message
  });
});

/**
 * Get all chat conversations for a doctor
 * @route GET /api/v1/doctor/chats
 * @access Private
 */
export const getConversations = catchAsync(async (req, res) => {
  const conversations = await doctorChatService.getConversations(req.user.id, req.query);
  res.status(200).json({
    status: 'success',
    data: conversations
  });
});

/**
 * Get a specific chat conversation with a patient
 * @route GET /api/v1/doctor/chats/:patientId
 * @access Private
 */
export const getConversation = catchAsync(async (req, res) => {
  const conversation = await doctorChatService.getConversation(req.user.id, req.params.patientId);
  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

/**
 * Get chat messages for a specific conversation
 * @route GET /api/v1/doctor/chats/:patientId/messages
 * @access Private
 */
export const getMessages = catchAsync(async (req, res) => {
  const messages = await doctorChatService.getMessages(req.user.id, req.params.patientId, req.query);
  res.status(200).json({
    status: 'success',
    data: messages
  });
});

/**
 * Mark messages as read
 * @route PATCH /api/v1/doctor/chats/:patientId/messages/read
 * @access Private
 */
export const markMessagesAsRead = catchAsync(async (req, res) => {
  const result = await doctorChatService.markMessagesAsRead(req.user.id, req.params.patientId);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Delete a message
 * @route DELETE /api/v1/doctor/chats/messages/:messageId
 * @access Private
 */
export const deleteMessage = catchAsync(async (req, res) => {
  await doctorChatService.deleteMessage(req.user.id, req.params.messageId);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get unread message count
 * @route GET /api/v1/doctor/chats/unread-count
 * @access Private
 */
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await doctorChatService.getUnreadCount(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { count }
  });
});

/**
 * Get chat statistics
 * @route GET /api/v1/doctor/chats/statistics
 * @access Private
 */
export const getChatStatistics = catchAsync(async (req, res) => {
  const statistics = await doctorChatService.getChatStatistics(req.user.id);
  res.status(200).json({
    status: 'success',
    data: statistics
  });
});

/**
 * Search messages
 * @route GET /api/v1/doctor/chats/search
 * @access Private
 */
export const searchMessages = catchAsync(async (req, res) => {
  const results = await doctorChatService.searchMessages(req.user.id, req.query);
  res.status(200).json({
    status: 'success',
    data: results
  });
});

/**
 * Get recent conversations
 * @route GET /api/v1/doctor/chats/recent
 * @access Private
 */
export const getRecentConversations = catchAsync(async (req, res) => {
  const conversations = await doctorChatService.getRecentConversations(req.user.id);
  res.status(200).json({
    status: 'success',
    data: conversations
  });
});

/**
 * Get chat participants
 * @route GET /api/v1/doctor/chats/participants
 * @access Private
 */
export const getParticipants = catchAsync(async (req, res) => {
  const participants = await doctorChatService.getParticipants(req.user.id);
  res.status(200).json({
    status: 'success',
    data: participants
  });
});

/**
 * Get conversation settings
 * @route GET /api/v1/doctor/chats/settings
 * @access Private
 */
export const getConversationSettings = catchAsync(async (req, res) => {
  const settings = await doctorChatService.getConversationSettings(req.user.id);
  res.status(200).json({
    status: 'success',
    data: settings
  });
});

/**
 * Update conversation settings
 * @route PATCH /api/v1/doctor/chats/settings
 * @access Private
 */
export const updateConversationSettings = catchAsync(async (req, res) => {
  const settings = await doctorChatService.updateConversationSettings(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: settings
  });
});

/**
 * Get message attachments
 * @route GET /api/v1/doctor/chats/messages/:messageId/attachments
 * @access Private
 */
export const getMessageAttachments = catchAsync(async (req, res) => {
  const attachments = await doctorChatService.getMessageAttachments(req.user.id, req.params.messageId);
  res.status(200).json({
    status: 'success',
    data: attachments
  });
});

/**
 * Send message with attachments
 * @route POST /api/v1/doctor/chats/messages/attachments
 * @access Private
 */
export const sendMessageWithAttachments = catchAsync(async (req, res) => {
  const message = await doctorChatService.sendMessageWithAttachments(req.user.id, req.body, req.files);
  res.status(201).json({
    status: 'success',
    data: message
  });
}); 