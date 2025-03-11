// Global type declarations
declare global {
    interface Crypto {
        // Use a more general type that can accommodate both implementations
        SHA224?: (data: string) => Buffer;
    }
}

// This export is needed to make this a module
export { }; 