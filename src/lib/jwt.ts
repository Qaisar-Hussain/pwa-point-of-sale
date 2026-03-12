import { jwtVerify, SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
);

export async function signJwt(payload: object, options?: { expiresIn?: string }) {
  try {
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(options?.expiresIn || '30d')
      .sign(SECRET_KEY);
    
    return token;
  } catch (e) {
    console.error(`[JWT] Token signing failed:`, e);
    throw e;
  }
}

export async function verifyJwt(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload;
  } catch (e) {
    return null;
  }
}
