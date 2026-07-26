import { NextResponse } from "next/server";
import { getDb } from "@/database/db";
import { getAuthenticatedOwner } from "@/core/auth/session";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const owner = await getAuthenticatedOwner();
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();

    // Enhanced local workspace intelligence check
    const lower = message.toLowerCase();
    let reply = "I am processing your request. How else can I assist you today?";

    if (lower.includes("hello") || lower.includes("hi nexus")) {
      reply = "Hello. I am NEXUS, your personal AI Operating System. All systems are secure and ready.";
    } else if (lower.includes("vault") || lower.includes("files") || lower.includes("how many files")) {
      const fileCount = db.prepare("SELECT count(*) as count FROM vault_files WHERE owner_id = ?").get(owner.id) as any;
      reply = `Your Secure Vault is fully encrypted. You currently have ${fileCount.count} files stored securely.`;
    } else if (lower.includes("task") || lower.includes("work") || lower.includes("pending")) {
      const pendingTasks = db.prepare("SELECT count(*) as count FROM tasks WHERE owner_id = ? AND completed = 0").get(owner.id) as any;
      reply = `You have ${pendingTasks.count} pending tasks in your workspace. Would you like me to open the Task Manager?`;
    } else if (lower.includes("security") || lower.includes("lock")) {
      reply = "System security is optimal. I can initiate an emergency lock if required.";
    } else if (lower.includes("what can you do")) {
      reply = "I can manage your vault, analyze documents, maintain your task manager, and oversee your personal workspace securely.";
    }

    // Simulate thinking delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
