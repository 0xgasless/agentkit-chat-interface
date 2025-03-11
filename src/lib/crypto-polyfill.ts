// Browser-safe crypto polyfill that includes SHA224 support
import { createHash } from 'crypto-browserify';

// Add SHA224 to the Crypto interface
declare global {
    interface Crypto {
        SHA224?: (data: string) => Buffer;
    }
}

// Only execute this code once
let polyfillApplied = false;

// Function to safely apply the polyfill
function applyPolyfill() {
    // Don't apply multiple times
    if (polyfillApplied) return;

    try {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        // Initialize crypto object if it doesn't exist
        if (!window.crypto) {
            Object.defineProperty(window, 'crypto', {
                value: {},
                writable: true,
                configurable: true
            });
        }

        // Initialize subtle if it doesn't exist
        if (!window.crypto.subtle) {
            Object.defineProperty(window.crypto, 'subtle', {
                value: {},
                writable: true,
                configurable: true
            });
        }

        // Only add SHA224 if it doesn't already exist
        if (!window.crypto.SHA224) {
            // Use defineProperty for better property definition
            Object.defineProperty(window.crypto, 'SHA224', {
                value: (data: string) => createHash('sha224').update(data).digest(),
                writable: false,
                configurable: true
            });
        }

        polyfillApplied = true;
        console.log("Crypto SHA224 polyfill successfully applied");
    } catch (error) {
        console.error("Failed to apply crypto polyfill:", error);
    }
}

// Apply the polyfill immediately
applyPolyfill();

export default { applyPolyfill }; 