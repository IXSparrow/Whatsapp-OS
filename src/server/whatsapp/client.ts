import { WhatsAppProvider } from './provider';
import { MockWhatsAppProvider } from './mockProvider';
import { WhatsAppWebProvider } from './webProvider';

// Determine which provider to use based on env vars
// For development, we default to Mock. Set USE_REAL_WHATSAPP=true to use the real one.
const useRealProvider = process.env.USE_REAL_WHATSAPP === 'true';

export const whatsappClient: WhatsAppProvider = useRealProvider 
  ? new WhatsAppWebProvider() 
  : new MockWhatsAppProvider();
