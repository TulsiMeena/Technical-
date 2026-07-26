import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] });
    }

    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();

    const searchTerm = `%${query}%`;

    const files = db.prepare(`
      SELECT id, name as title, 'file' as type, created_at
      FROM vault_files
      WHERE owner_id = ? AND name LIKE ?
      LIMIT 10
    `).all(owner.id, searchTerm);

    const tasks = db.prepare(`
      SELECT id, title, 'task' as type, created_at
      FROM tasks
      WHERE owner_id = ? AND title LIKE ?
      LIMIT 10
    `).all(owner.id, searchTerm);

    const results = [...files, ...tasks].sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
