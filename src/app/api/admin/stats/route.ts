import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const KHMER_DAYS = ['អាទិត្យ (Sun)', 'ច័ន្ទ (Mon)', 'អង្គារ (Tue)', 'ពុធ (Wed)', 'ព្រហ (Thu)', 'សុក្រ (Fri)', 'សៅរ៍ (Sat)'];

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    // 7 days ago timestamp
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      paidOrders,
      totalUsers,
      totalProducts,
      totalFiles,
      totalDownloads,
      availableKeys,
      soldKeys,
      totalTutorials,
      recentOrders,
      recentOrdersForChart,
      recentDownloadsForChart,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.file.count(),
      prisma.download.count(),
      prisma.productKey.count({ where: { status: 'AVAILABLE' } }),
      prisma.productKey.count({ where: { status: 'SOLD' } }),
      prisma.tutorial.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      // Orders in past 7 days
      prisma.order.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      // Downloads in past 7 days
      prisma.download.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Build real 7-day data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const year = d.getFullYear();
      const month = d.getMonth();
      const date = d.getDate();

      const dayStart = new Date(year, month, date, 0, 0, 0, 0).getTime();
      const dayEnd = new Date(year, month, date, 23, 59, 59, 999).getTime();

      const dayName = KHMER_DAYS[d.getDay()];
      const shortDate = `${date}/${month + 1}`;

      // Calculate real stats for this day
      const dayOrders = recentOrdersForChart.filter((ord) => {
        const t = new Date(ord.createdAt).getTime();
        return t >= dayStart && t <= dayEnd;
      });

      const dayRevenue = dayOrders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((acc, o) => acc + o.total, 0);

      const dayDownloads = recentDownloadsForChart.filter((dl) => {
        const t = new Date(dl.createdAt).getTime();
        return t >= dayStart && t <= dayEnd;
      }).length;

      chartData.push({
        day: `${dayName}`,
        shortDate,
        revenue: Math.round(dayRevenue * 100) / 100,
        orders: dayOrders.length,
        downloads: dayDownloads,
      });
    }

    const maxRevenue = Math.max(...chartData.map((c) => c.revenue), 10);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      totalFiles,
      totalDownloads,
      availableKeys,
      soldKeys,
      totalTutorials,
      recentOrders,
      chartData,
      maxRevenue,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN_ADMIN_ONLY' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'សិទ្ធិមិនគ្រប់គ្រាន់ (Admin Only)' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'កំហុសបច្ចេកទេស' }, { status: 500 });
  }
}
