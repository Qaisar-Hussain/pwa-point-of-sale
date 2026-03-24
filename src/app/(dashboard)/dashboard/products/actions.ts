'use server';

import { revalidatePath } from 'next/cache';

async function getCurrentBusinessId() {
  const { cookies } = await import('next/headers');
  const { verifyJwt } = await import('@/lib/jwt');
  const { default: prisma } = await import('@/lib/prisma');

  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJwt(token);
  if (!decoded || typeof decoded.id !== 'string') return null;

  const userId = decoded.id;

  // Try owner role first
  const ownerBusiness = await prisma.business.findFirst({ where: { ownerId: userId } });
  if (ownerBusiness) return ownerBusiness.id;

  // Then try business memberships (for staff/managers)
  const userBusiness = await prisma.userBusiness.findFirst({ where: { userId } });
  if (userBusiness) return userBusiness.businessId;

  // If no business found, create a single implicit business for the user.
  // This makes the SaaS behavior per-user equivalent and avoids 'Unauthorized' for non-joined owners.
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
  });

  return products.map(p => {
    const anyP = p as any;
    return {
      ...p,
      price: p.price.toString(),
      category: anyP.category || (anyP.description ? String(anyP.description) : undefined),
    };
  });
}

export async function createProduct(formData: FormData) {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId || typeof businessId !== 'string') throw new Error('Unauthorized');

  const name = String(formData.get('name') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const sku = String(formData.get('sku') || '').trim();
  const price = parseFloat(String(formData.get('price') || '0'));
  const quantity = parseInt(String(formData.get('quantity') || '0'), 10);

  if (!name || Number.isNaN(price)) {
    throw new Error('Missing required fields');
  }

  const { default: prisma } = await import('@/lib/prisma');
  let productTableHasCategory = false;
  let productTableHasSku = false;

  try {
    const columns: Array<{ column_name: string }> = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'products' AND column_name IN ('category', 'sku')
    `;

    productTableHasCategory = columns.some((c) => c.column_name === 'category');
    productTableHasSku = columns.some((c) => c.column_name === 'sku');
  } catch (_err) {
    // If introspection fails (DB not Postgres or not yet migrated), fallback to safe behavior.
  }

  const data: any = {
    name,
    price,
    quantity: Number.isNaN(quantity) ? 0 : quantity,
    businessId,
  };

  if (productTableHasCategory && category) data.category = category;
  else if (!productTableHasCategory && category) data.description = category;

  if (productTableHasSku && sku) data.sku = sku;

  await prisma.product.create({ data });
  revalidatePath('/dashboard/products');
}

export async function updateProduct(formData: FormData) {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId || typeof businessId !== 'string') throw new Error('Unauthorized');

  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const sku = String(formData.get('sku') || '').trim();
  const price = parseFloat(String(formData.get('price') || '0'));
  const quantity = parseInt(String(formData.get('quantity') || '0'), 10);

  if (!id || !name || Number.isNaN(price)) {
    throw new Error('Missing required fields');
  }

  const { default: prisma } = await import('@/lib/prisma');
  let productTableHasCategory = false;
  let productTableHasSku = false;

  try {
    const columns: Array<{ column_name: string }> = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'products' AND column_name IN ('category', 'sku')
    `;

    productTableHasCategory = columns.some((c) => c.column_name === 'category');
    productTableHasSku = columns.some((c) => c.column_name === 'sku');
  } catch (_err) {
    // fallback
  }

  const updateData: any = {
    name,
    price,
    quantity: Number.isNaN(quantity) ? 0 : quantity,
  };
  if (productTableHasCategory) updateData.category = category || null;
  else updateData.description = category || null;

  if (productTableHasSku) updateData.sku = sku || null;

  await prisma.product.update({ where: { id }, data: updateData });
  revalidatePath('/dashboard/products');
}

export async function deleteProduct(formData: FormData) {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId || typeof businessId !== 'string') throw new Error('Unauthorized');

  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing product id');

  const { default: prisma } = await import('@/lib/prisma');
  await prisma.product.delete({ where: { id } });
  revalidatePath('/dashboard/products');
}