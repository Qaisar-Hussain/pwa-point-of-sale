'use server';

async function getCurrentBusinessId() {
  const { cookies } = await import('next/headers');
  const { verifyJwt } = await import('@/lib/jwt');
  const { default: prisma } = await import('@/lib/prisma');

  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJwt(token);
  if (!decoded || typeof decoded.id !== 'string') return null;

  const userId = decoded.id;

  const ownerBusiness = await prisma.business.findFirst({ where: { ownerId: userId } });
  if (ownerBusiness) return ownerBusiness.id;

  const userBusiness = await prisma.userBusiness.findFirst({ where: { userId } });
  if (userBusiness) return userBusiness.businessId;

  const newBusiness = await prisma.business.create({
    data: {
      name: `Business of ${userId}`,
      ownerId: userId,
    },
  });
  await prisma.userBusiness.create({
    data: {
      userId,
      businessId: newBusiness.id,
      role: 'OWNER',
    },
  });

  return newBusiness.id;
}

export async function getProducts() {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId) return [];

  const { default: prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, sku: true, price: true, quantity: true },
  });
  return products.map(p => ({ ...p, price: p.price.toString() }));
}