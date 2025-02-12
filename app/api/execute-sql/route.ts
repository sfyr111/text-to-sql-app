import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { sql: sqlQuery } = await req.json();
    
    // 只允许 SELECT 语句
    if (!sqlQuery.trim().toLowerCase().startsWith('select')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed' },
        { status: 400 }
      );
    }

    const result = await sql(sqlQuery);
    return NextResponse.json({ results: result });
  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute SQL query' },
      { status: 500 }
    );
  }
}

// 添加 OPTIONS 方法支持
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 