import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import {
  sendMessage,
  getConversations,
  getConversation,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  getChatStatistics,
  searchMessages,
  getRecentConversations,
  getParticipants,
  getConversationSettings,
  updateConversationSettings,
  getMessageAttachments,
  sendMessageWithAttachments
} from '../../controllers/doctor/doctor-chat.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Chat Management Routes
router.post('/messages', sendMessage);
router.get('/', getConversations);
router.get('/recent', getRecentConversations);
router.get('/statistics', getChatStatistics);
router.get('/unread-count', getUnreadCount);
router.get('/search', searchMessages);
router.get('/:patientId', getConversation);
router.get('/:patientId/messages', getMessages);
router.patch('/:patientId/messages/read', markMessagesAsRead);
router.get('/:patientId/participants', getParticipants);
router.get('/:patientId/settings', getConversationSettings);
router.put('/:patientId/settings', updateConversationSettings);
router.delete('/messages/:messageId', deleteMessage);
router.get('/messages/:messageId/attachments', getMessageAttachments);
router.post('/with-attachments', sendMessageWithAttachments);

export default router; 