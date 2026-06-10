import { PrismaClient, DeliveryState } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar registros previos para evitar errores de duplicidad
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Roles
  const [adminRole, sellerRole, userRole] = await Promise.all([
    prisma.role.create({ data: { name: 'admin' } }),
    prisma.role.create({ data: { name: 'seller' } }),
    prisma.role.create({ data: { name: 'user' } }),
  ]);

  const hashedPwd = '$2b$10$A7b4hzE.T5cGdtacleFvtOtv1cpbDGQgfzD9XWWWQJsoK/lMre2sq'; // 123456

  // Users
  const sellerUser = await prisma.user.create({
    data: {
      username: 'seller_demo',
      email: 'seller@example.com',
      passwordHash: hashedPwd,
      fullName: 'Seller Demo',
      roleId: sellerRole.id,
      phone: '+54 11 5555-0101',
      address: 'Av. Corrientes 1234, CABA',
      activeState: true,
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      username: 'buyer_demo',
      email: 'buyer@example.com',
      passwordHash: hashedPwd,
      fullName: 'Buyer Demo',
      roleId: userRole.id,
      phone: '+54 11 5555-0102',
      address: 'Calle Falsa 742, CABA',
      activeState: true,
    },
  });

  // Optional admin user for completeness
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_demo',
      email: 'admin@example.com',
      passwordHash: hashedPwd,
      fullName: 'Admin Demo',
      roleId: adminRole.id,
      activeState: true,
    },
  });

  // Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Tech & Style Supplies',
      cuil: '30-12345678-9',
      email: 'proveedor@example.com',
      phoneNumber: '+54 11 4444-2233',
      activeState: true,
    },
  });

  // Categories
  const [electronica, moda] = await Promise.all([
    prisma.category.create({ data: { name: 'Electrónica' } }),
    prisma.category.create({ data: { name: 'Moda' } }),
  ]);

  // Products
  const p1 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max 256GB Titanio Negro',
      description: 'El iPhone más potente jamás creado. Chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7". Incluye cable USB-C y manual.',
      imagePath: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=400&fit=crop',
      price: 1099990,
      categoryId: electronica.id,
      supplierId: supplier.id,
      activeState: true,
      stock: 12,
    }
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
      description: 'Smartphone definitivo con S Pen integrado. Pantalla Dynamic AMOLED 2X de 6.8", cámara de 200MP, Galaxy AI integrado.',
      imagePath: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=400&fit=crop',
      price: 899990,
      categoryId: electronica.id,
      supplierId: supplier.id,
      activeState: true,
      stock: 8,
    }
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'MacBook Pro 14" M3 Pro 18GB 512GB',
      description: 'Potencia profesional en formato portátil. Chip M3 Pro, Neural Engine, pantalla Liquid Retina XDR, hasta 22 horas de batería.',
      imagePath: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
      price: 1349990,
      categoryId: electronica.id,
      supplierId: supplier.id,
      activeState: true,
      stock: 5,
    }
  });

  const p4 = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5 Auriculares Noise Cancelling',
      description: 'La mejor cancelación de ruido del mundo. 30 horas de batería, LDAC, DSEE Extreme, conexión multipunto. Negro grafito.',
      imagePath: 'https://www.sony.com.bo/image/6145c1d32e6ac8e63a46c912dc33c5bb?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
      price: 249990,
      categoryId: electronica.id,
      supplierId: supplier.id,
      activeState: true,
      stock: 25,
    }
  });

  const p5 = await prisma.product.create({
    data: {
      name: 'Camiseta Nike Dri-FIT Academy',
      description: 'Tecnología que absorbe el sudor. Tejido transpirable, corte estándar, 100% poliéster. Disponible en varios colores.',
      imagePath: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop',
      price: 16990,
      categoryId: moda.id,
      supplierId: supplier.id,
      activeState: true,
      stock: 100,
    }
  });

  // Mock Sale
  const sale = await prisma.sale.create({
    data: {
      userId: buyerUser.id,
      address: buyerUser.address,
      deliveryState: DeliveryState.PENDIENTE,
      totalPrice: p1.price.toNumber() + p5.price.toNumber() * 2,
    }
  });

  await prisma.saleItem.createMany({
    data: [
      {
        saleId: sale.id,
        productId: p1.id,
        amount: 1,
        price: p1.price,
      },
      {
        saleId: sale.id,
        productId: p5.id,
        amount: 2,
        price: p5.price,
      }
    ]
  });

  console.log('Seed executed successfully.');
}

main()
  .catch((error) => {
    console.error('Error during seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });