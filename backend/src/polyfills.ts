// Polyfill for crypto in Node.js 18
// This file MUST be imported before any other imports
import * as crypto from 'crypto';

// For DigitalOcean managed databases with self-signed certificates
// This MUST be set before any database connections are attempted
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = crypto.webcrypto || crypto;
}

// Also set it on global for older packages
if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = crypto.webcrypto || crypto;
}