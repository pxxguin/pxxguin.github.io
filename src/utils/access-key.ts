const STORAGE_KEY = "terminal-access-key";
const SESSION_FLAG = "terminal-access-granted";

function randomHex(bytes: number): string {
	const arr = new Uint8Array(bytes);
	crypto.getRandomValues(arr);
	return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Returns a key that is random per browser session (tab/window), but stable
 * for the lifetime of that session so the terminal easter egg (`cat system.conf`)
 * and the /login page always agree on the same value.
 */
export function getAccessKey(): string {
	if (typeof window === "undefined") return "";
	let key = sessionStorage.getItem(STORAGE_KEY);
	if (!key) {
		key = randomHex(4);
		sessionStorage.setItem(STORAGE_KEY, key);
	}
	return key;
}

export function grantAccess(): void {
	if (typeof window === "undefined") return;
	sessionStorage.setItem(SESSION_FLAG, "true");
}

export function hasAccess(): boolean {
	if (typeof window === "undefined") return false;
	return sessionStorage.getItem(SESSION_FLAG) === "true";
}

export function clearAccess(): void {
	if (typeof window === "undefined") return;
	sessionStorage.removeItem(SESSION_FLAG);
}
