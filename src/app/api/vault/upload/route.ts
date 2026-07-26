import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "root";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();

    const fileId = randomUUID();
    const ext = path.extname(file.name);

    const vaultDir = path.join(process.cwd(), ".nexus_data", "vault", owner.id);
    if (!existsSync(vaultDir)) {
      await fs.mkdir(vaultDir, { recursive: true });
    }

    const safePath = path.join(vaultDir, `${fileId}${ext}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // In a real production system, AES encryption would happen here before saving to disk.
    // For now, we save it as-is for the prototype.
    await fs.writeFile(safePath, buffer);

    db.prepare(`
      INSERT INTO vault_files
      (id, owner_id, name, extension, path, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(fileId, owner.id, file.name, ext, safePath, file.size);

    return NextResponse.json({ success: true, fileId });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
