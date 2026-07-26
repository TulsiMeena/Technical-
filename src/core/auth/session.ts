import { cookies } from "next/headers";
import { getDb } from "@/database/db";

export async function getAuthenticatedOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nexus_session")?.value;

  if (!token) return null;

  try {
    const db = getDb();
    const session = db.prepare(`
      SELECT owner_id, expires_at
      FROM sessions
      WHERE token = ?
    `).get(token) as any;

    if (!session) return null;

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
      return null;
    }

    const owner = db.prepare("SELECT id FROM owner WHERE id = ?").get(session.owner_id) as any;
    return owner || null;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}
