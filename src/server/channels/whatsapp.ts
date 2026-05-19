import { whatsappClient } from '../whatsapp/client';

export interface ChannelSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppChannel {
  async sendMessage(phone: string, text: string): Promise<ChannelSendResult> {
    try {
      // If WhatsApp access token exists in environment variables but is not fully authenticated,
      // we check for connected status or fallback to mock provider gracefully.
      const res = await whatsappClient.sendMessage(phone, text);
      return {
        success: res.success,
        messageId: res.messageId,
        error: res.error
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'WhatsApp channel offline'
      };
    }
  }
}

export const whatsappChannel = new WhatsAppChannel();
