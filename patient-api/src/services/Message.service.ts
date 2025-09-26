import User from '../models/User';
import MDMessagesService, { CreateMessagePayload, GetMessagesParams } from './mdIntegration/MDMessages.service';



class MessageService {
  async getMessagesByUserId(userId: string, params: GetMessagesParams = {}) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.mdPatientId) {
      throw new Error('User does not have an MD Patient ID');
    }

    user?.update({
      newMessages: false
    })

    return MDMessagesService.getMessages(user.mdPatientId, { ...params, channel: 'patient' });
  }

  async createMessageForUser(userId: string, payload: CreateMessagePayload) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.mdPatientId) {
      throw new Error('User does not have an MD Patient ID');
    }

    return MDMessagesService.createMessage(user.mdPatientId, payload);
  }

  async markMessageAsReadForUser(userId: string, messageId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.mdPatientId) {
      throw new Error('User does not have an MD Patient ID');
    }

    return MDMessagesService.markMessageAsRead(user.mdPatientId, messageId);
  }

  async markMessageAsUnreadForUser(userId: string, messageId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.mdPatientId) {
      throw new Error('User does not have an MD Patient ID');
    }

    return MDMessagesService.markMessageAsUnread(user.mdPatientId, messageId);
  }
}

export default new MessageService();