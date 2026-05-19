import { ChannelSendResult } from './whatsapp';

export class LinkedInChannel {
  async sendMessage(profileId: string, text: string): Promise<ChannelSendResult> {
    return {
      success: false,
      error: 'LinkedIn provider not connected.'
    };
  }
}

export const linkedinChannel = new LinkedInChannel();
