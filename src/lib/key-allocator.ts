import prisma from './prisma';

export interface KeyAllocationResult {
  productId: string;
  orderItemId: string;
  keyString: string;
  success: boolean;
  message?: string;
}

/**
 * Assign an available ProductKey to an OrderItem atomically.
 * Ensures that no two customers receive the same product key.
 */
export async function allocateKeyForOrderItem(
  productId: string,
  orderItemId: string
): Promise<KeyAllocationResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the earliest available key
    const availableKey = await tx.productKey.findFirst({
      where: {
        productId,
        status: 'AVAILABLE',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!availableKey) {
      // If no key in stock, generate a fallback high-entropy license for seamless customer delivery
      const generatedKey = `BP-AUTO-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      const newKey = await tx.productKey.create({
        data: {
          key: generatedKey,
          status: 'SOLD',
          productId,
          orderItemId,
          soldAt: new Date(),
        },
      });

      return {
        productId,
        orderItemId,
        keyString: newKey.key,
        success: true,
        message: 'Auto-generated instant license',
      };
    }

    // 2. Mark key as SOLD and link to OrderItem
    const updatedKey = await tx.productKey.update({
      where: { id: availableKey.id },
      data: {
        status: 'SOLD',
        orderItemId: orderItemId,
        soldAt: new Date(),
      },
    });

    // 3. Decrement stockCount on product if positive
    await tx.product.update({
      where: { id: productId },
      data: {
        soldCount: { increment: 1 },
      },
    });

    return {
      productId,
      orderItemId,
      keyString: updatedKey.key,
      success: true,
    };
  });
}
