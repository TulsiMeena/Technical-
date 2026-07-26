import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import fs from "fs/promises";
import path from "path";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Auth check
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const db = getDb();

    const fileMeta = db.prepare("SELECT path, extension, name FROM vault_files WHERE id = ? AND owner_id = ?").get(id, owner.id) as any;
    if (!fileMeta) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(fileMeta.path);
    // In production, decryption would happen here

    // Determine mime type basic
    let mimeType = "application/octet-stream";
    const ext = fileMeta.extension?.toLowerCase();
    if (ext === ".pdf") mimeType = "application/pdf";
    else if (ext === ".png") mimeType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".webp") mimeType = "image/webp";
    else if (ext === ".mp4") mimeType = "video/mp4";
    else if (ext === ".webm") mimeType = "video/webm";
    else if (ext === ".mp3") mimeType = "audio/mpeg";
    else if (ext === ".wav") mimeType = "audio/wav";
    else if (ext === ".txt") mimeType = "text/plain";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileMeta.name}"`,
      },
    });

  } catch (error: any) {
    console.error("Preview error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
