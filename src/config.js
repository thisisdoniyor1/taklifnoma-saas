const isLocalRuntime = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  const localHosts = new Set(['', 'localhost', '127.0.0.1', '0.0.0.0', '::1']);
  return localHosts.has(window.location.hostname);
})();

let rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (isLocalRuntime
    ? 'http://localhost:8100/api'
    : 'https://taklifnoma-saas-production.up.railway.app/api');

// Ensure absolute URLs have a protocol to prevent browser treating them as relative paths
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  if (!rawApiUrl.startsWith('/')) {
    rawApiUrl = 'https://' + rawApiUrl;
  }
}

export const API_URL = rawApiUrl;

export const PAYMENT_CONFIG = {
  whatsappNumber: '992900000000', // Update with your WhatsApp number (e.g. 992XXXXXXXXX)
  banks: [
    {
      id: 'dc',
      name: 'Dushanbe City Bank',
      accountName: 'Taklifnoma VIP',
      cardNumber: '9771 0000 0000 0000',
    },
    {
      id: 'alif',
      name: 'Alif Mobi',
      accountName: 'Taklifnoma VIP',
      cardNumber: '5058 0000 0000 0000',
    },
    {
      id: 'kortimilli',
      name: 'Korti Milli',
      accountName: 'Taklifnoma VIP',
      cardNumber: '9771 1111 2222 3333',
    },
  ],
};

