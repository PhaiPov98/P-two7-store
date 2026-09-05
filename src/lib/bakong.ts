import prisma from '@/lib/prisma';

export interface BakongTransactionResult {
  paid: boolean;
  raw?: any;
  error?: string;
  transaction?: {
    hash?: string;
    fromAccountId?: string;
    toAccountId?: string;
    amount?: number;
    currency?: string;
    description?: string;
    createdDateMs?: number;
  };
}

/**
 * Check if a Bakong KHQR transaction has been paid using its MD5 hash via NBC Bakong Open API
 */
export async function checkBakongTransactionByMD5(md5: string): Promise<BakongTransactionResult> {
  if (!md5) {
    return { paid: false, error: 'Missing MD5 hash' };
  }

  // Get token from DB settings or process.env
  let token = process.env.BAKONG_OPEN_API_TOKEN || '';
  try {
    const tokenSetting = await prisma.setting.findUnique({
      where: { key: 'bakong_api_token' },
    });
    if (tokenSetting?.value) {
      token = tokenSetting.value.trim();
    }
  } catch (e) {
    console.warn('Could not read bakong_api_token from DB:', e);
  }

  if (!token) {
    // If no Bakong Open API token is configured yet
    return {
      paid: false,
      error: 'NO_TOKEN_CONFIGURED',
    };
  }

  try {
    const response = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ md5: md5.toLowerCase() }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (data.responseCode === 0 && data.data) {
      return {
        paid: true,
        transaction: data.data,
        raw: data,
      };
    }

    return {
      paid: false,
      error: data.responseMessage || 'Transaction not found or not yet completed',
      raw: data,
    };
  } catch (err: any) {
    console.error('Bakong API check error:', err);
    return {
      paid: false,
      error: err?.message || 'Failed to connect to Bakong Open API',
    };
  }
}
