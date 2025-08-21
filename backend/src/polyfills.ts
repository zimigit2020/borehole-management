// Polyfill for crypto in Node.js 18
// This file MUST be imported before any other imports
import * as crypto from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = crypto.webcrypto || crypto;
}

// Also set it on global for older packages
if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = crypto.webcrypto || crypto;
}