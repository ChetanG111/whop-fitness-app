import { Whop } from "@whop/sdk";
console.log('Whop API Key loaded:', process.env.WHOP_API_KEY?.substring(0, 8));
export const whopsdk = new Whop({
	appID: process.env.NEXT_PUBLIC_WHOP_APP_ID || 'app_test',
	apiKey: process.env.WHOP_API_KEY || 'test-api-key', // Provide fallback for tests
	// Use Buffer for base64 encoding to work in Node (btoa is a browser API)
	webhookKey: Buffer.from(process.env.WHOP_WEBHOOK_SECRET || "").toString("base64"),
});

/**
 * Fetch Whop user details and optionally check access for a resource (company/experience).
 * @param userId - Whop user id (e.g. user_xxx)
 * @param resourceId - optional companyId or experienceId to check access against
 * @returns { id, username, access_level, profile_picture }
 */
export async function getWhopUser(userId: string, resourceId?: string) {
	if (!userId) throw new Error("getWhopUser: userId is required");

	try {
	// Fetch the user record (SDK exposes `retrieve` for single resources)
	// Cast to `any` to tolerate varying SDK response shapes across versions.
	const user: any = await whopsdk.users.retrieve(userId);

		// Normalize common fields (SDK may return different shapes)
		const id = user?.id || user?.user_id || userId;
		const username = user?.username || user?.name || user?.email || null;
		const profile_picture =
			user?.picture ||
			user?.avatar ||
			user?.profile?.avatar ||
			user?.profile_picture ||
			null;

		// Optionally check access for a given resource
		let access_level = null;
		if (resourceId) {
			const access: any = await whopsdk.users.checkAccess(resourceId, { id: userId });
			// Debug: log the raw access response so we can diagnose missing access_level values
			console.debug("whop: checkAccess response for", resourceId, "userId", userId, ":", access);

			// Robust extractor: handle several possible shapes returned by the SDK or API.
			function resolveAccessLevel(a: any): string | null {
				if (a == null) return null;
				// Common flattened fields
				if (typeof a === 'string' && a) return a;
				if (typeof a === 'object') {
					const candidates = [
						a.access_level,
						a.accessLevel,
						a.level,
						a.access,
						a.permission,
						a.role,
						// nested common shapes
						(a.data && a.data.access_level),
						(a.data && a.data.level),
						(a.result && a.result.access_level),
						(a.attributes && a.attributes.access_level),
					];
					for (const c of candidates) {
						if (typeof c === 'string' && c) return c;
					}
					// If boolean, convert to a readable flag
					if (typeof a === 'boolean') return a ? 'granted' : 'none';
					// If array, try to resolve first element
					if (Array.isArray(a) && a.length) {
						const first = a[0];
						if (typeof first === 'string') return first;
						if (typeof first === 'object') return resolveAccessLevel(first);
					}
					// fallback: look for any string value on the object
					for (const v of Object.values(a)) {
						if (typeof v === 'string' && v) return v;
					}
				}
				return null;
			}

			access_level = resolveAccessLevel(access) || null;
		}

		return { id, username, access_level, profile_picture };
	} catch (err) {
		// Keep error visible for server logs; callers can handle as needed
		console.error("getWhopUser error:", err);
		throw err;
	}
}