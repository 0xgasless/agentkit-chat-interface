// lib/server/crypto-utils.ts
// Mark this file as server-only to prevent it from being included in client bundles
import 'server-only';

// Import crypto functions only on the server
import crypto from 'node:crypto';

/**
 * Server-side only function to handle any SHA224 operations
 */
export function generateSHA224Hash(data: string): string {
    return crypto.createHash('sha224').update(data).digest('hex');
}

/**
 * Server-side only function to handle key operations
 */
export function processPrivateKey(privateKey: string): { processed: string } {
    // Your private key processing logic here
    return { processed: privateKey };
}

// Export other crypto functions you need