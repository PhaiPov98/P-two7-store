import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { allocateKeyForOrderItem } from '@/lib/key-allocator';
import { sendNewOrderAlert } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      paymentMethod,
      paymentSlip,
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'សូមបំពេញព័ត៌មានអតិថិជន និងទំនិញឱ្យបានត្រឹមត្រូវ' },
        { status: 400 }
      );
    }

    // Check Auto-fulfill setting
    let autoFulfill = true;
    try {
      const autoSetting = await prisma.setting.findUnique({
        where: { key: 'payment_auto_fulfill' },
      });
      if (autoSetting && autoSetting.value === 'false') {
        autoFulfill = false;
      }
    } catch (e) {
      // default true
    }

    // 1. Identify or Create User
    let userId = session?.id;
    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase().trim() },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create a guest account with default password 'guest123'
        const bcrypt = (await import('bcryptjs')).default;
        const defaultPassword = await bcrypt.hash('guest123', 10);
        const newUser = await prisma.user.create({
          data: {
            name: customerName,
            email: customerEmail.toLowerCase().trim(),
            password: defaultPassword,
            phone: customerPhone || null,
            role: 'CUSTOMER',
          },
        });
        userId = newUser.id;
      }
    }

    // 2. Fetch fresh products from DB to prevent client-side price tampering
    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of items) {
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

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'គ្មានផលិតផលត្រឹមត្រូវក្នុងកន្ត្រកទេ' }, { status: 400 });
    }

    // 3. Calculate Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENT') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }

        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const total = Math.max(0, subtotal - discount);

    // 4. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BP-${dateStr}-${randomSuffix}`;

    const orderPaymentStatus = autoFulfill ? 'PAID' : 'PENDING';
    const orderStatus = autoFulfill ? 'COMPLETED' : 'PENDING';

    // 5. Create Order & Items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        subtotal,
        discount,
        total,
        paymentStatus: orderPaymentStatus,
        orderStatus,
        paymentMethod: paymentMethod || 'BAKONG_KHQR',
        paymentDetails: JSON.stringify({
          gateway: paymentMethod || 'BAKONG_KHQR',
          transactionId: `TXN-${Date.now()}`,
          verifiedAt: autoFulfill ? new Date().toISOString() : null,
          hasSlip: Boolean(paymentSlip),
          paymentSlip: paymentSlip || null,
        }),
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 6. Allocate Product Keys for each ordered item (if autoFulfill)
    const allocatedKeys: Array<{ productName: string; key: string }> = [];

    if (autoFulfill) {
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
    }

    // 6.5 Retrieve attached file downloads
    const productIds = validatedItems.map((i) => i.productId).filter(Boolean) as string[];
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

    if (autoFulfill) {
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
    }

    // 7. Record Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        currency: 'USD',
        provider: paymentMethod || 'BAKONG_KHQR',
        transactionId: `TXN-${Date.now()}`,
        status: autoFulfill ? 'SUCCESS' : 'PENDING',
        payload: JSON.stringify({
          orderNumber,
          itemsCount: validatedItems.length,
          hasSlip: Boolean(paymentSlip),
        }),
      },
    });

    // 8. Send Telegram New Order Alert to Admin (with photo slip if attached)
    sendNewOrderAlert({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      total,
      paymentMethod: paymentMethod || 'BAKONG_KHQR',
      paymentSlip: paymentSlip || null,
      items: validatedItems.map((item) => ({ name: item.name, quantity: item.quantity })),
    }).catch((err) => console.error('Telegram order alert error:', err));

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total,
      allocatedKeys,
      downloads,
      paymentStatus: orderPaymentStatus,
      message: autoFulfill
        ? 'ការទូទាត់ និងបញ្ជាទិញបានជោគជ័យ! Product Key និង File Download ត្រូវបានផ្ញើជូនរួចរាល់។'
        : 'ការបញ្ជាទិញទទួលបានជោគជ័យ! ក្រុមការងារកំពុងផ្ទៀងផ្ទាត់ការទូទាត់របស់អ្នក។',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាក្នុងដំណើរការបញ្ជាទិញ សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    );
  }
}
