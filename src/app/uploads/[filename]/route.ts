import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDirectory = path.join(process.cwd(), "public", "uploads");
const imageTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Uploads are created with randomUUID(), so accept only that exact filename
// shape and the image extensions accepted by the media upload action.
const safeFilename = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|gif)$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  if (!safeFilename.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(filename).slice(1).toLowerCase();
  const contentType = imageTypes[extension];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(uploadDirectory, filename));
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error("Unable to read uploaded media:", error);
    return new NextResponse("Unable to serve image", { status: 500 });
  }
}
