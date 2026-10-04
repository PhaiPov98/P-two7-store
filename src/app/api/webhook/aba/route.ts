import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { allocateKeyForOrderItem } from '@/lib/key-allocator';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * ABA Mobile Notification Webhook Receiver
 * Parses incoming notifications forwarded from Android App (Notification Forwarder, Tasker, MacroDroid)
 */
export async function POST(request: Request) {
  try {
    let fullText = '';
    let bodyObj: any = {};

    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        bodyObj = await request.json();
        fullText = JSON.stringify(bodyObj);
        if (bodyObj.title || bodyObj.text || bodyObj.notification || bodyObj.message) {
          fullText = `${bodyObj.title || ''} ${bodyObj.text || ''} ${bodyObj.notification || ''} ${bodyObj.message || ''} ${bodyObj.content || ''}`;
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        const entries = Object.fromEntries(formData.entries());
        fullText = Object.values(entries).join(' ');
      } else {
        fullText = await request.text();
      }
    } catch {
      fullText = await request.text();
    }

    // Also check query params
    const { searchParams } = new URL(request.url);
    if (searchParams.toString()) {
      fullText += ' ' + searchParams.toString();
    }

    console.log('Incoming ABA Webhook Notification FullText:', fullText);

    if (!fullText.trim()) {
      return NextResponse.json({ error: 'Empty notification content' }, { status: 400 });
    }

    // Check if notification is from ABA Bank (received money)
    // Common patterns:
    // "You received USD 1.00 from SOK VIBOL"
    // "You have received $1.00 from..."
    // "You received 4,100 KHR from..."
    // "លោកអ្នកបានទទួលប្រាក់ USD 1.00 ពី..."
    const isReceiveMoney =
      /received|ទទួល|transfer|payment|deposit/i.test(fullText) &&
      !/sent|transfer to|paid to|កាត់ប្រាក់/i.test(fullText);

    if (!isReceiveMoney) {
      return NextResponse.json({
        success: false,
        message: 'Notification ignored (not a received money alert)',
      });
    }

    // 1. Extract Amount & Currency
    let amount: number | null = null;
    let currency = 'USD';

    // Match USD (e.g. "USD 1.00", "$1.00", "1.00 USD", "USD1.00", "1.00$")
    const usdMatch = fullText.match(/(?:USD|\$)\s*([\d,]+\.?\d*)|([\d,]+\.?\d*)\s*(?:USD|\$)/i);
    if (usdMatch) {
      const rawAmt = (usdMatch[1] || usdMatch[2]).replace(/,/g, '');
      amount = parseFloat(rawAmt);
      currency = 'USD';
    } else {
      // Match KHR (e.g. "4,100 KHR", "KHR 4100", "4100 ៛")
      const khrMatch = fullText.match(/(?:KHR|៛)\s*([\d,]+)|([\d,]+)\s*(?:KHR|៛)/i);
      if (khrMatch) {
        const rawAmt = (khrMatch[1] || khrMatch[2]).replace(/,/g, '');
        amount = parseFloat(rawAmt);
        currency = 'KHR';
      }
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Could not extract valid amount from notification',
        raw: fullText,
      });
    }

    // 2. Extract Sender Name
    const senderMatch = fullText.match(/from\s+([^(\n.,]+)|ពី\s+([^(\n.,]+)/i);
    const senderName = (senderMatch?.[1] || senderMatch?.[2] || 'ABA Customer').trim();

    // Cache in Setting table for desktop app & cross-platform license checking
    try {
      const existing = await prisma.setting.findUnique({
        where: { key: 'aba_recent_notifications' },
      });
      let notifList: Array<{ raw: string; amount: number; currency: string; sender: string; timestamp: number }> = [];
      if (existing?.value) {
        try { notifList = JSON.parse(existing.value); } catch {}
      }
      notifList.unshift({
        raw: fullText,
        amount: amount || 0,
        currency: currency || 'USD',
        sender: senderName || '',
        timestamp: Date.now(),
      });
      notifList = notifList.slice(0, 50);
      await prisma.setting.upsert({
        where: { key: 'aba_recent_notifications' },
        update: { value: JSON.stringify(notifList) },
        create: { key: 'aba_recent_notifications', value: JSON.stringify(notifList) },
      });
    } catch (e) {
      console.error('Error caching ABA notification:', e);
    }

    // 3. Find latest PENDING order matching amount within last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Search for order
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        createdAt: { gte: thirtyMinsAgo },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Find closest matching order
    let matchedOrder = pendingOrders.find((o) => {
      if (currency === 'USD') {
        return Math.abs(o.total - (amount as number)) < 0.01;
      } else {
        // Convert KHR to USD equivalent or match riel
        const approxUSD = (amount as number) / 4100;
        return Math.abs(o.total - approxUSD) < 0.1 || Math.abs(o.total * 4100 - (amount as number)) < 100;
      }
    });

    if (!matchedOrder) {
      console.warn(`No pending order found matching amount ${amount} ${currency}`);
      return NextResponse.json({
        success: true,
        matched: false,
        message: `Notification received ($${amount} from ${senderName}), but no pending order matched currently.`,
        amount,
        currency,
        senderName,
      });
    }

    // 4. Auto-fulfill matched order
    const updatedOrder = await prisma.order.update({
      where: { id: matchedOrder.id },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        paymentDetails: JSON.stringify({
          gateway: 'ABA_MOBILE_NOTIFICATION',
          verifiedVia: 'ABA Push Notification Webhook',
          sender: senderName,
          amount,
          currency,
          rawNotification: fullText,
          verifiedAt: new Date().toISOString(),
        }),
      },
      include: { items: true },
    });

    // 5. Allocate Product Keys
    const allocatedKeys: Array<{ productName: string; key: string }> = [];
    for (const orderItem of updatedOrder.items) {
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

    // 6. Record Payment
    await prisma.payment.create({
      data: {
        orderId: matchedOrder.id,
        amount: matchedOrder.total,
        currency: 'USD',
        provider: 'ABA_PUSH_NOTIFICATION',
        transactionId: `ABA-NOTI-${Date.now()}`,
        status: 'SUCCESS',
        payload: JSON.stringify({
          rawNotification: fullText,
          senderName,
          amount,
          currency,
        }),
      },
    });

    // 7. Send Telegram Alert to Admin
    const tgMsg = `⚡ <b>[ABA AUTO-PAID WEBHOOK]</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>Order:</b> <code>${matchedOrder.orderNumber}</code>\n` +
      `👤 <b>Customer:</b> ${matchedOrder.customerName} (${matchedOrder.customerEmail})\n` +
      `💵 <b>Amount Paid:</b> <b>$${amount} ${currency}</b>\n` +
      `🏦 <b>Sender:</b> ${senderName}\n` +
      `🔑 <b>Keys Allocated:</b> ${allocatedKeys.length} key(s)\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `✅ <i>ប្រព័ន្ធបានបញ្ចេញ Product Key ជូនអតិថិជនស្វ័យប្រវត្ត 100%!</i>`;

    try {
      await sendTelegramNotification(tgMsg);
    } catch (e) {
      console.error('Telegram notification error:', e);
    }

    return NextResponse.json({
      success: true,
      matched: true,
      orderNumber: matchedOrder.orderNumber,
      customerName: matchedOrder.customerName,
      amount,
      allocatedKeysCount: allocatedKeys.length,
    });
  } catch (error: any) {
    console.error('ABA Webhook Error:', error);
    return NextResponse.json({ error: error?.message || 'Server error processing webhook' }, { status: 500 });
  }
}

// Allow GET for payment verification by desktop apps, simple notification webhooks, and checking status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const incomingMsg = searchParams.get('msg') || searchParams.get('text') || searchParams.get('notify') || searchParams.get('content');

  // Channel: Ultra-simple 1-line Android notification forwarder via GET
  if (incomingMsg) {
    let amount: number | null = null;
    let currency = 'USD';
    const usdMatch = incomingMsg.match(/(?:USD|\$)\s*([\d,]+\.?\d*)|([\d,]+\.?\d*)\s*(?:USD|\$)/i);
    if (usdMatch) {
      amount = parseFloat((usdMatch[1] || usdMatch[2]).replace(/,/g, ''));
      currency = 'USD';
    } else {
      const khrMatch = incomingMsg.match(/(?:KHR|៛)\s*([\d,]+)|([\d,]+)\s*(?:KHR|៛)/i);
      if (khrMatch) {
        amount = parseFloat((khrMatch[1] || khrMatch[2]).replace(/,/g, ''));
        currency = 'KHR';
      }
    }
    const senderMatch = incomingMsg.match(/from\s+([^(\n.,]+)|ពី\s+([^(\n.,]+)/i);
    const senderName = (senderMatch?.[1] || senderMatch?.[2] || 'ABA Customer').trim();

    try {
      const existing = await prisma.setting.findUnique({
        where: { key: 'aba_recent_notifications' },
      });
      let notifList: Array<{ raw: string; amount: number; currency: string; sender: string; timestamp: number }> = [];
      if (existing?.value) {
        try { notifList = JSON.parse(existing.value); } catch {}
      }
      notifList.unshift({
        raw: incomingMsg,
        amount: amount || 0,
        currency: currency || 'USD',
        sender: senderName || '',
        timestamp: Date.now(),
      });
      notifList = notifList.slice(0, 50);
      await prisma.setting.upsert({
        where: { key: 'aba_recent_notifications' },
        update: { value: JSON.stringify(notifList) },
        create: { key: 'aba_recent_notifications', value: JSON.stringify(notifList) },
      });
    } catch (e) {
      console.error('Error caching ABA GET notification:', e);
    }

    return NextResponse.json({ success: true, message: 'Notification received via GET', amount, sender: senderName });
  }

  const bill = searchParams.get('bill') || searchParams.get('check');
  const amountStr = searchParams.get('amount');
  const targetAmount = amountStr ? parseFloat(amountStr) : null;

  if (bill || targetAmount) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'aba_recent_notifications' },
      });
      if (setting?.value) {
        let list: Array<{ raw: string; amount: number; currency: string; sender: string; timestamp: number; consumed?: boolean }> = JSON.parse(setting.value);
        const now = Date.now();
        const tenMins = 10 * 60 * 1000;

        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (item.consumed) continue;
          if (now - item.timestamp > tenMins) continue;

          const text = (item.raw || '').toLowerCase();
          const billLower = (bill || '').toLowerCase();
          const billDigits = (bill || '').replace(/\D/g, '');

          const billMatch = bill && (text.includes(billLower) || (billDigits.length >= 5 && text.includes(billDigits)));
          const amountMatch = targetAmount !== null && Math.abs(item.amount - targetAmount) < 0.01;

          if (billMatch || amountMatch) {
            // Mark consumed to avoid duplicate key issuances
            list[i].consumed = true;
            try {
              await prisma.setting.update({
                where: { key: 'aba_recent_notifications' },
                data: { value: JSON.stringify(list) },
              });
            } catch {}

            return NextResponse.json({
              paid: true,
              amount: item.amount,
              currency: item.currency,
              sender: item.sender,
              timestamp: item.timestamp,
            });
          }
        }
      }
    } catch (err: any) {
      return NextResponse.json({ paid: false, error: err.message }, { status: 500 });
    }
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({
    status: 'online',
    message: 'ABA Mobile Notification Webhook Receiver is active!',
    endpoint: 'POST /api/webhook/aba',
    format: {
      title: 'ABA Mobile',
      text: 'You received USD 1.00 from SOK VIBOL',
    },
  });
}
