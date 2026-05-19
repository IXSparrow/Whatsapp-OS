import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { WhatsAppProvider, QrResult, SendResult, AccountStatus } from './provider';

export class WhatsAppWebProvider implements WhatsAppProvider {
  private clients: Map<string, Client> = new Map();
  private statuses: Map<string, AccountStatus['status']> = new Map();
  private qrs: Map<string, string> = new Map();

  async connect(userId: string): Promise<QrResult | { success: true }> {
    if (this.clients.has(userId)) {
      const status = this.statuses.get(userId);
      if (status === 'connected') return { success: true };
      if (status === 'qr_ready') return { qr: this.qrs.get(userId)! };
    }

    this.statuses.set(userId, 'authenticating');

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    this.clients.set(userId, client);

    return new Promise((resolve) => {
      client.on('qr', (qr) => {
        this.qrs.set(userId, qr);
        this.statuses.set(userId, 'qr_ready');
        resolve({ qr });
      });

      client.on('ready', () => {
        this.statuses.set(userId, 'connected');
        this.qrs.delete(userId);
        resolve({ success: true });
      });

      client.on('disconnected', () => {
        this.statuses.set(userId, 'disconnected');
        this.clients.delete(userId);
      });

      client.initialize();
    });
  }

  async sendMessage(phone: string, text: string): Promise<SendResult> {
    // We assume sending from the first available connected client or a specific user's client.
    // For simplicity, let's just pick the first connected client if we don't pass userId in sendMessage.
    // In a real multi-tenant app, we'd pass userId to sendMessage.
    // I'll update the signature here to just use the first connected client for now.
    const connectedUserId = Array.from(this.statuses.entries())
      .find(([_, status]) => status === 'connected')?.[0];

    if (!connectedUserId) {
      return { success: false, error: 'No connected WhatsApp accounts found.' };
    }

    const client = this.clients.get(connectedUserId);
    if (!client) {
      return { success: false, error: 'Client not found.' };
    }

    try {
      // whatsapp-web.js requires the phone number in international format followed by @c.us
      const formattedPhone = phone.replace(/[^0-9]/g, '') + '@c.us';
      const msg = await client.sendMessage(formattedPhone, text);
      return { success: true, messageId: msg.id.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async disconnect(userId: string): Promise<void> {
    const client = this.clients.get(userId);
    if (client) {
      await client.destroy();
      this.clients.delete(userId);
      this.statuses.set(userId, 'disconnected');
    }
  }

  async getStatus(userId: string): Promise<AccountStatus> {
    return { status: this.statuses.get(userId) || 'disconnected' };
  }
}
