import { NextResponse } from "next/server";
import { getDb } from "@/database/db";

export async function GET() {
  try {
    const db = getDb();
    const owner = db.prepare("SELECT setup_completed FROM owner LIMIT 1").get() as any;

    if (!owner) {
      return NextResponse.json({ setupNeeded: true });
    }

    return NextResponse.json({ setupNeeded: owner.setup_completed === 0 });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
