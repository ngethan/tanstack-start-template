import { env } from "@/env";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key for storage operations
const supabaseAdmin = createClient(
	env.SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY,
);

const COMMENT_ASSETS_BUCKET = "comment_assets";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];

/**
 * Upload a file to the comment assets bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadCommentImage(
	file: Buffer,
	fileName: string,
	contentType: string,
): Promise<string> {
	const { data, error } = await supabaseAdmin.storage
		.from(COMMENT_ASSETS_BUCKET)
		.upload(fileName, file, {
			contentType,
			upsert: false,
		});

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	// Get public URL
	const {
		data: { publicUrl },
	} = supabaseAdmin.storage.from(COMMENT_ASSETS_BUCKET).getPublicUrl(data.path);

	return publicUrl;
}
