import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();

    const files = db.prepare(`
      SELECT id, name, extension, size, is_encrypted, is_pinned, created_at
      FROM vault_files
      WHERE owner_id = ?
      ORDER BY created_at DESC
    `).all(owner.id);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("List files error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
