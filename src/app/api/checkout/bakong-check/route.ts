import { NextResponse } from 'next/server';
import { checkBakongTransactionByMD5 } from '@/lib/bakong';
import prisma from '@/lib/prisma';
import { allocateKeyForOrderItem } from '@/lib/key-allocator';
import { sendNewOrderAlert } from '@/lib/telegram';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { md5, orderData } = body;

    if (!md5) {
      return NextResponse.json({ error: 'Missing MD5 hash' }, { status: 400 });
    }

    const checkResult = await checkBakongTransactionByMD5(md5);

    if (!checkResult.paid) {
      return NextResponse.json({
        paid: false,
        message: checkResult.error === 'NO_TOKEN_CONFIGURED' 
          ? 'Bakong Open API token not yet configured in admin settings' 
          : checkResult.error || 'Transaction not yet completed on bank ledger',
        noToken: checkResult.error === 'NO_TOKEN_CONFIGURED',
      });
    }

    // Payment is verified on Bakong bank ledger!
    // If orderData is provided, auto-create and complete the order immediately
    if (orderData && orderData.items && orderData.items.length > 0) {
      const session = await getCurrentUser();
      const customerEmail = orderData.customerEmail?.toLowerCase()?.trim();
      const customerName = orderData.customerName?.trim() || 'Valued Customer';
      const customerPhone = orderData.customerPhone?.trim() || null;

      let userId = session?.id;
      if (!userId && customerEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: customerEmail },
        });
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const bcrypt = (await import('bcryptjs')).default;
          const defaultPassword = await bcrypt.hash('guest123', 10);
          const newUser = await prisma.user.create({
            data: {
              name: customerName,
              email: customerEmail,
              password: defaultPassword,
              phone: customerPhone,
              role: 'CUSTOMER',
            },
          });
          userId = newUser.id;
        }
      }

      // Calculate validated items
      let subtotal = 0;
      const validatedItems: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of orderData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (product) {
          const itemPrice = product.price;
          const itemQty = Math.max(1, item.quantity || 1);
          subtotal += itemPrice * itemQty;
          validatedItems.push({
            productId: product.id,
            name: product.name,
            price: itemPrice,
            quantity: itemQty,
          });
        }
      }

      const total = subtotal; // can apply discount if coupon provided
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BP-${dateStr}-${randomSuffix}`;

      // Create Order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: userId || undefined,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          subtotal,
          discount: 0,
          total,
          paymentStatus: 'PAID',
          orderStatus: 'COMPLETED',
          paymentMethod: 'BAKONG_KHQR',
          paymentDetails: JSON.stringify({
            gateway: 'BAKONG_KHQR',
            bakongHash: checkResult.transaction?.hash,
            verifiedVia: 'Bakong OpenAPI Realtime',
            verifiedAt: new Date().toISOString(),
            raw: checkResult.transaction,
          }),
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        } as any,
        include: {
          items: true,
        },
      });

      // Allocate Product Keys
      const allocatedKeys: Array<{ productName: string; key: string }> = [];
      for (const orderItem of order.items) {
        if (orderItem.productId) {
          for (let i = 0; i < orderItem.quantity; i++) {
            const allocation = await allocateKeyForOrderItem(orderItem.productId, orderItem.id);
            allocatedKeys.push({
              productName: orderItem.name,
              key: allocation.keyString,
            });
          }
        }
      }

      // Retrieve attached files/downloads
      const productIds = validatedItems.map((i) => i.productId);
      const productsWithDownloads = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { file: true },
      });

      const downloads: Array<{
        productId: string;
        productName: string;
        fileName: string;
        fileType: string;
        fileSize: string;
        downloadUrl: string;
        version?: string;
      }> = [];

      for (const prod of productsWithDownloads) {
        if (prod.file) {
          downloads.push({
            productId: prod.id,
            productName: prod.name,
            fileName: prod.file.title,
            fileType: prod.file.fileType || 'EXE',
            fileSize: prod.file.fileSize || 'Direct',
            downloadUrl: `/api/download/${prod.file.id}`,
            version: prod.file.version || prod.version || '1.0',
          });
        } else if (prod.downloadUrl) {
          downloads.push({
            productId: prod.id,
            productName: prod.name,
            fileName: prod.name,
            fileType: prod.platform || 'EXE',
            fileSize: 'Cloud',
            downloadUrl: prod.downloadUrl,
            version: prod.version || '1.0',
          });
        }
      }

      // Record Payment
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          currency: 'USD',
          provider: 'BAKONG_KHQR',
          transactionId: checkResult.transaction?.hash || `TXN-${Date.now()}`,
          status: 'SUCCESS',
          payload: JSON.stringify(checkResult.transaction),
        },
      });

      // Send Telegram notification to Admin
      sendNewOrderAlert({
        orderNumber: order.orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        total,
        paymentMethod: 'BAKONG_KHQR (Auto-Verified)',
        items: validatedItems.map((item) => ({ name: item.name, quantity: item.quantity })),
      }).catch((err) => console.error('Telegram alert error:', err));

      return NextResponse.json({
        paid: true,
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        total,
        allocatedKeys,
        downloads,
        transaction: checkResult.transaction,
      });
    }

    return NextResponse.json({
      paid: true,
      transaction: checkResult.transaction,
    });
  } catch (error: any) {
    console.error('Bakong check error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
