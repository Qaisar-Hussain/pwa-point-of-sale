import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'NextAuth is configured' });
}

export async function POST() {
  return NextResponse.json({ message: 'NextAuth POST configured' });
}
