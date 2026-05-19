import { WhatsAppProvider, QrResult, SendResult, AccountStatus } from './provider';

export class MockWhatsAppProvider implements WhatsAppProvider {
  private status: 'connected' | 'disconnected' | 'authenticating' | 'qr_ready' = 'disconnected';

  async connect(userId: string): Promise<QrResult | { success: true }> {
    console.log(`[MockWhatsApp] Connect requested for ${userId}`);
    this.status = 'qr_ready';
    
    // Simulate delayed connection
    setTimeout(() => {
      this.status = 'connected';
      console.log(`[MockWhatsApp] ${userId} connected`);
    }, 5000);

    return { qr: 'mock-qr-code-string-for-testing' };
  }

  async sendMessage(phone: string, text: string): Promise<SendResult> {
    console.log(`[MockWhatsApp] Sending message to ${phone}: ${text}`);
    if (this.status !== 'connected') {
      return { success: false, error: 'Not connected' };
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, messageId: `mock-msg-${Date.now()}` });
      }, 1000);
    });
  }

  async disconnect(userId: string): Promise<void> {
    console.log(`[MockWhatsApp] Disconnected ${userId}`);
    this.status = 'disconnected';
  }

  async getStatus(userId: string): Promise<AccountStatus> {
    return { status: this.status };
  }
}
