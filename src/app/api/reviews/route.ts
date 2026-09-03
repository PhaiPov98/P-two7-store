import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = productId ? { productId } : {};

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'បរាជ័យក្នុងការទាញយកទិន្នន័យ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'សូមចូលគណនីដើម្បីធ្វើការវាយតម្លៃ (Please login to write a review)' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment?.trim()) {
      return NextResponse.json(
        { error: 'សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'ពិន្ទុត្រូវតែនៅចន្លោះពី ១ ដល់ ៥' },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'រកមិនឃើញផលិតផលនេះទេ' }, { status: 404 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating: Math.round(numRating),
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Recalculate average rating & review count for the product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'មានបញ្ហាក្នុងការរក្សាទុកការវាយតម្លៃ' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { requireAdmin } = await import('@/lib/auth');
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing Review ID' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const productId = review.productId;
    await prisma.review.delete({ where: { id } });

    // Recalculate average rating & review count for product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, message: 'បានលុបការវាយតម្លៃជោគជ័យ' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: error.message || 'មិនអាចលុបការវាយតម្លៃបានទេ' }, { status: 500 });
  }
}
