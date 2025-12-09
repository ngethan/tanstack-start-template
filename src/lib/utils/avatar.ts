/**
 * Generate a unique avatar URL using DiceBear API
 * @param seed - Unique seed for the avatar (email, name, or random string)
 * @param style - Avatar style (avataaars, bottts, identicon, etc.)
 * @returns Avatar URL
 */
export function generateAvatarUrl(
	seed: string,
	style:
		| "avataaars"
		| "bottts"
		| "identicon"
		| "initials"
		| "personas" = "avataaars",
): string {
	// Use a combination of seed and timestamp for uniqueness
	const uniqueSeed = `${seed}-${Date.now()}`;

	// DiceBear API URL with various styles
	const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(uniqueSeed)}`;

	return avatarUrl;
}

/**
 * Get a random avatar style
 */
export function getRandomAvatarStyle() {
	const styles = ["avataaars", "bottts", "personas", "identicon"] as const;
	return styles[Math.floor(Math.random() * styles.length)];
}

/**
 * Generate a fun, unique avatar with random style
 */
export function generateRandomAvatar(seed: string): string {
	const style = getRandomAvatarStyle();
	return generateAvatarUrl(seed, style);
}
