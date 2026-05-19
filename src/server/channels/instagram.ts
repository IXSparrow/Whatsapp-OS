import { ChannelSendResult } from './whatsapp';

export class InstagramChannel {
  async sendMessage(handle: string, text: string): Promise<ChannelSendResult> {
    return {
      success: false,
      error: 'Instagram DM provider not connected.'
    };
  }
}

export const instagramChannel = new InstagramChannel();
