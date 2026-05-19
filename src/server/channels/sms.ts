import { ChannelSendResult } from './whatsapp';

export class SMSChannel {
  async sendMessage(phone: string, text: string): Promise<ChannelSendResult> {
    return {
      success: false,
      error: 'SMS gateway not connected.'
    };
  }
}

export const smsChannel = new SMSChannel();
