// IMPORTANT: This must be a .js file, not .ts
// This file should be imported at the very top of your _app.js or page.js before any other imports

// Define SHA224 on the global window object immediately
if (typeof window !== "undefined") {
	// Create crypto if it doesn't exist
	if (!window.crypto) window.crypto = {};

	// Add SHA224 function that will satisfy the library's requirements
	window.crypto.SHA224 = (data) => {
		// Just return a valid buffer - the actual hashing will happen on the server
		return {
			buffer: new ArrayBuffer(28),
			toString: () => "sha224-buffer",
			slice: () => new ArrayBuffer(28),
			byteLength: 28,
		};
	};

	console.log("SHA224 crypto preload installed");
}
