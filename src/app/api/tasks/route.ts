import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { randomUUID } from "crypto";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function GET() {
  try {
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();

    const tasks = db.prepare("SELECT * FROM tasks WHERE owner_id = ? ORDER BY completed ASC, created_at DESC").all(owner.id);
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();

    const id = randomUUID();
    db.prepare("INSERT INTO tasks (id, owner_id, title) VALUES (?, ?, ?)").run(id, owner.id, title);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, completed } = await request.json();
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();

    db.prepare("UPDATE tasks SET completed = ? WHERE id = ? AND owner_id = ?").run(completed, id, owner.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const owner = await getAuthenticatedOwner();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();

    db.prepare("DELETE FROM tasks WHERE id = ? AND owner_id = ?").run(id, owner.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
