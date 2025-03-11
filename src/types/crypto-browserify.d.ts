declare module 'crypto-browserify' {
    export function createHash(algorithm: string): {
        update(data: string | Buffer): {
            digest(encoding?: string): Buffer;
            digest(): Buffer;
        }
    };

    // Add other crypto functions as needed
    export function randomBytes(size: number): Buffer;
    export function createHmac(algorithm: string, key: string | Buffer): any;
    // etc.
} 