import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const db = getDb();
    const owner = db.prepare("SELECT id, master_password_hash FROM owner LIMIT 1").get() as any;

    if (!owner) {
      return NextResponse.json({ error: "System not initialized" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, owner.master_password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Access Denied" }, { status: 401 });
    }

    // Create a secure session
    const token = randomUUID();
    const sessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 day expiration

    db.prepare(`
      INSERT INTO sessions (id, owner_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, owner.id, token, expiresAt.toISOString());

    const response = NextResponse.json({ success: true, redirect: "/dashboard" });
    response.cookies.set("nexus_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
