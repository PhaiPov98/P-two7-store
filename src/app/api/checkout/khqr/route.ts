import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBakongKHQR } from '@/lib/khqr';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = 'USD',
      customerName,
      customerEmail,
      customerPhone,
      items,
      couponCode,
    } = body;

    if (amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'ចំនួនទឹកប្រាក់មិនត្រឹមត្រូវ (Invalid amount)' }, { status: 400 });
    }

    // Load custom Bakong settings from DB if configured
    let bakongAccountId = process.env.BAKONG_ACCOUNT_ID || 'abaakhppxxx@abaa';
    let merchantName = process.env.BAKONG_MERCHANT_NAME || 'POV PHAI';
    let merchantCity = process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh';
    let bankName = 'ABA Bank';
    let accountNumber = '007 576 225';
    let accountName = 'POV PHAI';
    let abaPayLink = 'https://pay.ababank.com/oRF8/5ipp0sa2';

    try {
      const dbSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'bakong_account_id',
              'bakong_merchant_name',
              'bakong_merchant_city',
              'payment_bank_name',
              'payment_account_number',
              'payment_account_name',
              'aba_pay_link',
            ],
          },
        },
      });

      for (const s of dbSettings) {
        if (s.key === 'bakong_account_id' && s.value) bakongAccountId = s.value;
        if (s.key === 'bakong_merchant_name' && s.value) merchantName = s.value;
        if (s.key === 'bakong_merchant_city' && s.value) merchantCity = s.value;
        if (s.key === 'payment_bank_name' && s.value) bankName = s.value;
        if (s.key === 'payment_account_number' && s.value) accountNumber = s.value;
        if (s.key === 'payment_account_name' && s.value) accountName = s.value;
        if (s.key === 'aba_pay_link' && s.value) abaPayLink = s.value;
      }
    } catch (e) {
      console.warn('Could not read DB settings for KHQR, using defaults/env');
    }

    // Generate fresh unique Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BP-${dateStr}-${randomSuffix}`;
    const billNumber = orderNumber;

    // Create session PENDING order if items and customer details provided
    if (customerEmail && items && Array.isArray(items) && items.length > 0) {
      const session = await getCurrentUser();
      let userId = session?.id;
      const cleanEmail = customerEmail.toLowerCase().trim();

      if (!userId) {
        const existingUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const bcrypt = (await import('bcryptjs')).default;
          const defaultPassword = await bcrypt.hash('guest123', 10);
          const newUser = await prisma.user.create({
            data: {
              name: customerName || 'Valued Customer',
              email: cleanEmail,
              password: defaultPassword,
              phone: customerPhone || null,
              role: 'CUSTOMER',
            },
          });
          userId = newUser.id;
        }
      }

      // Fetch products to validate
      let subtotal = 0;
      const validatedItems: Array<{ productId: string; name: string; price: number; quantity: number }> = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const itemQty = Math.max(1, item.quantity || 1);
          subtotal += product.price * itemQty;
          validatedItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: itemQty,
          });
        }
      }

      await prisma.order.create({
        data: {
          orderNumber,
          userId: userId || undefined,
          customerName: customerName || 'Valued Customer',
          customerEmail: cleanEmail,
          customerPhone: customerPhone || null,
          subtotal,
          discount: 0,
          total: amount,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          paymentMethod: 'ABA_PAY',
          paymentDetails: JSON.stringify({
            gateway: 'ABA_PAY',
            billNumber,
            createdAt: new Date().toISOString(),
          }),
          items: {
            create: validatedItems.map((i) => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
          },
        } as any,
      });
    }

    const khqrResult = await generateBakongKHQR({
      bakongAccountId,
      merchantName,
      merchantCity,
      accountInformation: accountNumber,
      acquiringBank: bankName,
      amount,
      currency,
      billNumber,
      expirationMinutes: 15,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      ...khqrResult,
      bankName,
      accountNumber,
      accountName,
      abaPayLink,
    });
  } catch (error: any) {
    console.error('KHQR generation error:', error);
    return NextResponse.json(
      { error: error.message || 'មិនអាចបង្កើត Bakong KHQR បានទេ' },
      { status: 500 }
    );
  }
}
