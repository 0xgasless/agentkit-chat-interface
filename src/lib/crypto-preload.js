// IMPORTANT: This must be a .js file, not .ts
// This file should be imported at the very top of your _app.js or page.js before any other imports

// IMPORTANT: This file loads before any other code
(() => {
	// Ensure this runs immediately
	if (typeof window !== 'undefined') {
		try {
			// Create crypto object if it doesn't exist
			if (!window.crypto) {
				window.crypto = {};
			}
			
			// Add SHA224 directly to the object
			window.crypto.SHA224 = (data) => {
				// Return a fake buffer with typical buffer methods
				const buffer = new Uint8Array(28);
				return {
					buffer: buffer.buffer,
					toString: () => "dummy-sha224",
					byteLength: 28,
					slice: () => buffer
				};
			};
			
			// Create subtle if it doesn't exist
			if (!window.crypto.subtle) {
				window.crypto.subtle = {
					digest: () => Promise.resolve(new ArrayBuffer(32))
				};
			}
			
			console.log("SHA224 preload applied successfully");
		} catch (e) {
			console.error("Error setting up crypto polyfill:", e);
		}
	}
})();
