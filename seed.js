const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'STAFF'
    }
  });

  console.log('Created user:', user.email);

  // Create a business for the user
  const business = await prisma.business.create({
    data: {
      name: 'Test Business',
      ownerId: user.id
    }
  });

  console.log('Created business:', business.name);

  // Create user-business relationship
  await prisma.userBusiness.create({
    data: {
      userId: user.id,
      businessId: business.id,
      role: 'OWNER'
    }
  });

  console.log('Created user-business relationship');

  // Create some test products
  const products = await prisma.product.createMany({
    data: [
      {
        businessId: business.id,
        name: 'Test Product 1',
        sku: 'TP001',
        price: 10.99,
        cost: 5.50,
        quantity: 50,
        category: 'Electronics',
        description: 'Test product 1 description'
      },
      {
        businessId: business.id,
        name: 'Test Product 2',
        sku: 'TP002',
        price: 25.50,
        cost: 12.75,
        quantity: 30,
        category: 'Clothing',
        description: 'Test product 2 description'
      },
      {
        businessId: business.id,
        name: 'Test Product 3',
        sku: 'TP003',
        price: 5.99,
        cost: 2.50,
        quantity: 100,
        category: 'Food',
        description: 'Test product 3 description'
      }
    ]
  });

  console.log('Created', products.count, 'products');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });