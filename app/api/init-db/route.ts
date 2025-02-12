import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export const runtime = 'edge';

async function handler() {
  try {
    await initDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handler();
}

export async function POST() {
  return handler();
} 