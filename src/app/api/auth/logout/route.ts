import { successResponse } from '@/lib/utils';

export async function POST() {
  const response = successResponse(null, 'Logged out successfully');
  response.cookies.delete('token');
  return response;
}
