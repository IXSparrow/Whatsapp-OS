export interface QrResult {
  qr: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface AccountStatus {
  status: 'connected' | 'disconnected' | 'authenticating' | 'qr_ready';
}

export interface WhatsAppProvider {
  connect(userId: string): Promise<QrResult | { success: true }>;
  sendMessage(phone: string, text: string): Promise<SendResult>;
  disconnect(userId: string): Promise<void>;
  getStatus(userId: string): Promise<AccountStatus>;
}
