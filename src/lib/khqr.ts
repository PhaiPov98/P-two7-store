import QRCode from 'qrcode';
// @ts-ignore
import { BakongKHQR, khqrData, IndividualInfo, MerchantInfo } from 'bakong-khqr';

export interface KHQRGenerateParams {
  bakongAccountId?: string;
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  currency?: 'USD' | 'KHR';
  billNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  expirationMinutes?: number;
}

export interface KHQRResult {
  qrString: string;
  qrDataUrl: string;
  md5: string;
  bakongAccountId: string;
  merchantName: string;
  amount: number;
  currency: string;
  billNumber: string;
  expiresAt: string;
}

const DEFAULT_BAKONG_ACCOUNT = 'phaipov@abaa';
const DEFAULT_MERCHANT_NAME = 'P-TWO7 STORE';
const DEFAULT_MERCHANT_CITY = 'Phnom Penh';

/**
 * Generate a dynamic or static Bakong KHQR string and QR Code image
 */
export async function generateBakongKHQR(params: KHQRGenerateParams): Promise<KHQRResult> {
  const bakongAccountId = (params.bakongAccountId || process.env.BAKONG_ACCOUNT_ID || DEFAULT_BAKONG_ACCOUNT).trim();
  const merchantName = (params.merchantName || process.env.BAKONG_MERCHANT_NAME || DEFAULT_MERCHANT_NAME).trim();
  const merchantCity = (params.merchantCity || process.env.BAKONG_MERCHANT_CITY || DEFAULT_MERCHANT_CITY).trim();
  const currencyCode = params.currency === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd;
  const expirationMinutes = params.expirationMinutes || 15;
  const expiresAtMs = Date.now() + expirationMinutes * 60 * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();

  const billNumber = params.billNumber || `BP-${Date.now().toString().slice(-6)}`;
  const storeLabel = params.storeLabel || merchantName;

  const optionalData: any = {
    currency: currencyCode,
    amount: params.amount > 0 ? Number(params.amount.toFixed(2)) : undefined,
    billNumber,
    storeLabel,
    terminalLabel: params.terminalLabel || 'Store Online',
    expirationTimestamp: expiresAtMs,
    merchantCategoryCode: '5999',
  };

  const individualInfo = new IndividualInfo(
    bakongAccountId,
    merchantName,
    merchantCity,
    optionalData
  );

  const khqr = new BakongKHQR();
  const generated = khqr.generateIndividual(individualInfo);

  if (!generated || generated.status?.code !== 0 || !generated.data?.qr) {
    // Fallback: try merchant format or handle error
    throw new Error(generated?.status?.message || 'Failed to generate Bakong KHQR');
  }

  const qrString = generated.data.qr;
  const md5 = generated.data.md5 || '';

  // Generate high quality QR code data URL
  const qrDataUrl = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 380,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  return {
    qrString,
    qrDataUrl,
    md5,
    bakongAccountId,
    merchantName,
    amount: params.amount,
    currency: params.currency || 'USD',
    billNumber,
    expiresAt,
  };
}

/**
 * Verify if a given string is a valid Bakong KHQR
 */
export function verifyKHQR(qrString: string): boolean {
  try {
    const result = BakongKHQR.verify(qrString);
    return Boolean(result?.isValid);
  } catch {
    return false;
  }
}
