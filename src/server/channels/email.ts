import { ChannelSendResult } from './whatsapp';

export class EmailChannel {
  async sendMessage(to: string, text: string): Promise<ChannelSendResult> {
    return {
      success: false,
      error: 'Email provider not connected.'
    };
  }
}

export const emailChannel = new EmailChannel();
