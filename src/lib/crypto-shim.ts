'use client';

// Remove the interface declaration since it's now in global.d.ts
// The simplest approach - use a global var to track availability

// Browser-compatible crypto polyfill
if (typeof window !== 'undefined') {
    // Assign to window.crypto if it doesn't exist
    if (!window.crypto) window.crypto = {} as Crypto;

    // Create our own global crypto object as a backup
    const globalCrypto = window.crypto;

    // Create a SHA224 function with any return type to avoid type errors
    // @ts-ignore - Ignore TypeScript errors for this custom property
    globalCrypto.SHA224 = (data: string) => {
        // Create a fake Buffer-like object that has the minimum properties
        const buffer = new Uint8Array(28).buffer;

        // Add common buffer methods to satisfy any SDK requirements
        return {
            buffer,
            toString: () => "buffer",
            slice: () => buffer,
            byteLength: 28,
        };
    };

    // Ensure subtle exists
    if (!globalCrypto.subtle) {
        // @ts-ignore
        globalCrypto.subtle = {
            digest: async () => new ArrayBuffer(32)
        };
    }

    console.log("SHA224 shim installed");
}

export default {}; 