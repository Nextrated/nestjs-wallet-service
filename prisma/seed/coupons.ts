import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a Postgres pool using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create PrismaClient with the PrismaPg adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  await prisma.coupon.createMany({
    data: [
      {
        code: 'FESTIVE10',
        type: 'PERCENTAGE',
        value: 10,
        maxUsage: 100,
        expiresAt: new Date('2026-01-31'),
      },
      {
        code: 'WELCOME5000',
        type: 'FIXED',
        value: 5000,
        maxUsage: 50,
        expiresAt: new Date('2026-01-31'),
      },
      {
        code: 'FIRSTMONTHFREE',
        type: 'PERCENTAGE',
        value: 100,
        maxUsage: 50,
        expiresAt: new Date('2026-01-31'),
      },
    ],
    skipDuplicates: true, // ensures re-running seed doesn't duplicate
  });

  console.log('Coupons seeded successfully!');
}

// Run the seed
main()
  .catch((err) => {
    console.error('Error seeding coupons:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // close the pg pool
  });
