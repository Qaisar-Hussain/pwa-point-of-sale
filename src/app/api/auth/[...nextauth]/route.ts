import { NextResponse } from 'next/server';
// export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'NextAuth is configured' });
}

export async function POST() {
  return NextResponse.json({ message: 'NextAuth POST configured' });
}


// export async function POST() {
//   return Response.json({ ok: true });
// }
