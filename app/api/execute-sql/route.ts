import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { sql } = await req.json();
    
    // 只允许 SELECT 语句
    if (!sql.trim().toLowerCase().startsWith('select')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed' },
        { status: 400 }
      );
    }

    const results = db.prepare(sql).all();
    return NextResponse.json({ results });
  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute SQL query' },
      { status: 500 }
    );
  }
} 