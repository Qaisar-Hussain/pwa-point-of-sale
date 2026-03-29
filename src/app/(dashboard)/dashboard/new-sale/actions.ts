'use server';

async function getCurrentBusinessId() {
  const { cookies } = await import('next/headers');
  const { verifyJwt } = await import('@/lib/jwt');
  const { default: prisma } = await import('@/lib/prisma');

  const token = cookies().get('token')?.value;
  if (!token) return null;

  let decoded: any;
  try {
    decoded = await verifyJwt(token);
  } catch (err) {
    console.error('new-sale.getCurrentBusinessId: verifyJwt failed', err);
    return null;
  }

  if (!decoded || typeof decoded.id !== 'string') return null;

  const userId = decoded.id;

  try {
    // If the token refers to a user that doesn't exist in this DB, creating a business
    // will fail with a foreign-key error. Treat it as unauthorized so the user re-auths.
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) return null;

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
  } catch (err) {
    console.error('new-sale.getCurrentBusinessId: prisma failed', err);
    throw err;
  }
}

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

function toUserFacingSaleError(err: unknown): Error {
  const code = (err as any)?.code as string | undefined;
  const table = ((err as any)?.meta?.table as string | undefined)?.toLowerCase() || '';

  if (code === 'P2021' && (table.includes('sales') || table.includes('sale_items'))) {
    return new Error('Sales database is not fully initialized yet. Please retry in a moment or contact support.');
  }

  if (code === 'P1001') {
    return new Error('Database is temporarily unreachable. Please try again shortly.');
  }

  if (code === 'P1000') {
    return new Error('Database credentials are invalid. Please contact support.');
  }

  const message = err instanceof Error ? err.message : String(err || 'Unknown error');
  return new Error(message || 'Failed to record sale. Please try again.');
}

export async function getProducts() {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId) return [];

  const { default: prisma } = await import('@/lib/prisma');
  try {
    const products = await prisma.product.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, sku: true, price: true, quantity: true },
    });
    return products.map(p => ({ ...p, price: p.price.toString() }));
  } catch (err) {
    console.error('new-sale.getProducts: prisma failed', err);
    throw toUserFacingSaleError(err);
  }
}

export async function recordSale(cartItems: CartItem[]) {
  'use server';
  const businessId = await getCurrentBusinessId();
  if (!businessId) throw new Error('Business not found');

  const { default: prisma } = await import('@/lib/prisma');

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cannot complete sale: cart is empty.');
  }

  // Normalize input (POS rules: one line per product, sane quantities).
  const normalized = new Map<
    string,
    { id: string; name: string; sku: string; price: number; quantity: number }
  >();
  for (const item of cartItems) {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Cannot complete sale: invalid item price.');
    }
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Cannot complete sale: invalid item quantity.');
    }

    const existing = normalized.get(item.id);
    if (!existing) {
      normalized.set(item.id, { id: item.id, name: item.name, sku: item.sku, price, quantity });
      continue;
    }

    // If the same product is present multiple times, POS should treat it as a single line.
    // Prices should be consistent; otherwise fail rather than silently producing wrong totals.
    if (existing.price !== price) {
      throw new Error('Cannot complete sale: inconsistent prices for the same product.');
    }
    existing.quantity += quantity;
  }

  const items = Array.from(normalized.values());

  try {
    return await prisma.$transaction(async (tx) => {
      // Get current stock levels for all items in cart
      const productIds = items.map(item => item.id);
      const currentStock = await tx.product.findMany({
        where: { id: { in: productIds }, businessId },
        select: { id: true, quantity: true }
      });

      // Check if any item is out of stock
      for (const item of items) {
        const currentProduct = currentStock.find(p => p.id === item.id);
        if (!currentProduct || currentProduct.quantity < item.quantity) {
          const available = currentProduct?.quantity ?? 0;
          throw new Error(
            `Cannot complete sale: ${item.name} is out of stock or insufficient quantity available (available: ${available}).`
          );
        }
      }

      // Create a new sale record
      const sale = await tx.sale.create({
        data: {
          businessId,
          totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        },
      });

      // Create sale items and update product quantities
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Use conditional update to ensure we don't decrement below zero under concurrency.
        const updated = await tx.product.updateMany({
          where: { id: item.id, businessId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          const available = (currentStock.find(p => p.id === item.id)?.quantity ?? 0);
          throw new Error(
            `Cannot complete sale: ${item.name} is out of stock or insufficient quantity available (available: ${available}).`
          );
        }
      }

      // Return the created sale with line items + product names (no printing).
      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    });
  } catch (err) {
    console.error('new-sale.recordSale: prisma failed', err);
    throw toUserFacingSaleError(err);
  }
}

export { getCurrentBusinessId };
