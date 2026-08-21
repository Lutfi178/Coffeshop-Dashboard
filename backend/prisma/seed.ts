import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@brewlycoffee.com" },
    update: {},
    create: {
      name: "Admin Manager",
      email: "admin@brewlycoffee.com",
      password: "admin123password", // Simple hashed or plain password for demo
      role: "ADMIN",
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "kasir@brewlycoffee.com" },
    update: {},
    create: {
      name: "Kasir On-Duty",
      email: "kasir@brewlycoffee.com",
      password: "kasir123password",
      role: "CASHIER",
    },
  });

  console.log("✅ Users seeded:", { admin: admin.email, cashier: cashier.email });

  // Seed Categories
  const catCoffee = await prisma.category.upsert({
    where: { name: "Minuman & Kopi" },
    update: {},
    create: {
      name: "Minuman & Kopi",
      description: "Varian kopi arabika, teh, dan minuman segar",
      icon: "Coffee",
    },
  });

  const catBakery = await prisma.category.upsert({
    where: { name: "Makanan & Bakery" },
    update: {},
    create: {
      name: "Makanan & Bakery",
      description: "Roti, pastry perancis, dan makanan lezat",
      icon: "Utensils",
    },
  });

  console.log("✅ Categories seeded:", [catCoffee.name, catBakery.name]);

  // Seed Products
  const products = [
    {
      sku: "PRD-001",
      name: "Kopi Espresso Premium 250g",
      description: "Biji kopi arabika pilihan roasted medium dark",
      price: 85000,
      costPrice: 50000,
      stock: 24,
      minStock: 5,
      categoryId: catCoffee.id,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60",
    },
    {
      sku: "PRD-002",
      name: "Matcha Latte Powder 500g",
      description: "Bubuk matcha jepang kualitas tinggi",
      price: 120000,
      costPrice: 75000,
      stock: 3,
      minStock: 5,
      categoryId: catCoffee.id,
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60",
    },
    {
      sku: "PRD-003",
      name: "Croissant Butter Classic",
      description: "Pastry butter perancis yang renyah dan lembut",
      price: 28000,
      costPrice: 12000,
      stock: 18,
      minStock: 10,
      categoryId: catBakery.id,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
    },
    {
      sku: "PRD-004",
      name: "Sandwich Beef Cheese",
      description: "Sandwich daging sapi panggang dengan keju melted",
      price: 38000,
      costPrice: 20000,
      stock: 0,
      minStock: 5,
      categoryId: catBakery.id,
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60",
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  console.log("✅ Products seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
