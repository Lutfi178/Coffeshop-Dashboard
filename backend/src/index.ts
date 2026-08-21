import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "./lib/prisma";
import { calculateOrderTotal, calculateChange } from "./utils/calculator";
import { validateOrderItems, validateProductPrice, validateStock } from "./utils/validator";

export const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "brewly_coffee_secret_jwt_key_2026",
    })
  )
  .get("/", () => ({
    status: "success",
    message: "Brewly Coffee POS & Sales Dashboard API is running",
    timestamp: new Date().toISOString(),
  }))

  // Health Check Endpoint
  .get("/api/health", () => ({ status: "ok", uptime: process.uptime() }))

  // Authentication: POST /api/auth/login
  .post(
    "/api/auth/login",
    async ({ body, jwt, set }: { body: any; jwt: any; set: any }) => {
      const { email, password } = body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.password !== password) {
        set.status = 401;
        return { status: "error", message: "Email atau password tidak valid" };
      }

      const token = await jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return {
        status: "success",
        message: "Login berhasil",
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  // Dashboard Stats Endpoint
  .get("/api/dashboard/stats", async () => {
    const dbRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const activeProductsCount = await prisma.product.count();
    const lowStockAlertCount = await prisma.product.count({
      where: { stock: { lte: 5 } },
    });

    const totalRevenue = dbRevenue._sum.totalAmount || 0;
    const totalSalesCount = dbRevenue._count.id || 0;

    return {
      status: "success",
      data: {
        totalRevenue,
        totalSalesCount,
        activeProductsCount,
        lowStockAlertCount,
        todayRevenue: totalRevenue,
        todaySalesCount: totalSalesCount,
      },
    };
  })

  // Products CRUD Endpoints
  .get("/api/products", async () => {
    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      status: "success",
      data: dbProducts.map((p: any) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description || "",
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        minStock: p.minStock,
        categoryId: p.categoryId,
        categoryName: p.category ? p.category.name : "Umum",
        image: p.image || "",
      })),
    };
  })

  .post(
    "/api/products",
    async ({ body, set }: { body: any; set: any }) => {
      const priceValidation = validateProductPrice(body.price);
      if (!priceValidation.isValid) {
        set.status = 400;
        return { status: "error", message: priceValidation.message };
      }
      const stockValidation = validateStock(body.stock);
      if (!stockValidation.isValid) {
        set.status = 400;
        return { status: "error", message: stockValidation.message };
      }

      const createdProduct = await prisma.product.create({
        data: {
          sku: body.sku,
          name: body.name,
          description: body.description || "",
          price: body.price,
          costPrice: body.costPrice || 0,
          stock: body.stock,
          minStock: body.minStock || 5,
          categoryId: body.categoryId,
          image: body.image || "",
        },
      });

      return {
        status: "success",
        message: "Produk berhasil ditambahkan",
        data: createdProduct,
      };
    },
    {
      body: t.Object({
        sku: t.String(),
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.Number(),
        costPrice: t.Optional(t.Number()),
        stock: t.Number(),
        minStock: t.Optional(t.Number()),
        categoryId: t.String(),
        image: t.Optional(t.String()),
      }),
    }
  )

  // Categories CRUD Endpoints
  .get("/api/categories", async () => {
    const dbCategories = await prisma.category.findMany();
    return { status: "success", data: dbCategories };
  })

  // Checkout / Create Order Endpoint
  .post(
    "/api/orders",
    async ({ body, set }: { body: any; set: any }) => {
      const validation = validateOrderItems(body.items);
      if (!validation.isValid) {
        set.status = 400;
        return { status: "error", message: validation.message };
      }

      const orderCalc = calculateOrderTotal({
        items: body.items,
        discountPercent: body.discountPercent ?? 0,
        taxRatePercent: body.taxRatePercent ?? 11,
      });

      let changeAmount = 0;
      try {
        changeAmount = calculateChange(body.paidAmount, orderCalc.total);
      } catch (err: any) {
        set.status = 400;
        return { status: "error", message: err.message };
      }

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const dbOrder = await prisma.order.create({
        data: {
          invoiceNumber,
          customerName: body.customerName || "Pelanggan Umum",
          paymentMethod: (body.paymentMethod as any) || "CASH",
          subtotal: orderCalc.subtotal,
          discountAmount: orderCalc.discountAmount,
          taxAmount: orderCalc.taxAmount,
          totalAmount: orderCalc.total,
          paidAmount: body.paidAmount,
          changeAmount,
          status: "COMPLETED",
          items: {
            create: body.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.quantity * item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        status: "success",
        message: "Transaksi berhasil diproses",
        data: dbOrder,
      };
    },
    {
      body: t.Object({
        customerName: t.Optional(t.String()),
        paymentMethod: t.Optional(t.String()),
        paidAmount: t.Number(),
        discountPercent: t.Optional(t.Number()),
        taxRatePercent: t.Optional(t.Number()),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            price: t.Number(),
          })
        ),
      }),
    }
  );

const port = Number(process.env.PORT) || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`🚀 Brewly Coffee Elysia API Server running at http://localhost:${port}`);
  });
}
