import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const organs = db.prepare('SELECT * FROM organs').all();

    // Attach diseases to organs
    const diseasesStmt = db.prepare('SELECT * FROM diseases WHERE organId = ?');
    const fullOrgans = organs.map((organ: any) => ({
      ...organ,
      diseases: diseasesStmt.all(organ.id)
    }));

    return NextResponse.json(fullOrgans);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch organs' }, { status: 500 });
  }
}
