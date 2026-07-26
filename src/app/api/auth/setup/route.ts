import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const db = getDb();

    // Check if owner already exists
    const existing = db.prepare("SELECT id FROM owner LIMIT 1").get();
    if (existing) {
      return NextResponse.json({ error: "System is already initialized." }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const ownerId = randomUUID();

    db.prepare("INSERT INTO owner (id, master_password_hash, setup_completed) VALUES (?, ?, ?)").run(
      ownerId,
      hashedPassword,
      1
    );

    // Automatically create a session and cookie upon successful setup
    const token = randomUUID();
    const sessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    db.prepare(`
      INSERT INTO sessions (id, owner_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, ownerId, token, expiresAt.toISOString());

    const response = NextResponse.json({ success: true, message: "System initialized successfully." });
    response.cookies.set("nexus_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
