import QRCode from 'qrcode';
// @ts-ignore
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';

export interface KHQRGenerateParams {
  bakongAccountId?: string;
  merchantName?: string;
  merchantCity?: string;
  accountInformation?: string;
  acquiringBank?: string;
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

/**
 * Generate Official Dynamic Bakong / ABA KHQR with exact amount automatically filled in
 */
export async function generateBakongKHQR(params: KHQRGenerateParams): Promise<KHQRResult> {
  const bakongAccountId = (params.bakongAccountId || process.env.BAKONG_ACCOUNT_ID || 'abaakhppxxx@abaa').trim();
  const merchantName = (params.merchantName || process.env.BAKONG_MERCHANT_NAME || 'POV PHAI').trim();
  const merchantCity = (params.merchantCity || process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh').trim();
  const accountInformation = (params.accountInformation || '007576225').replace(/\s+/g, '');
  const acquiringBank = (params.acquiringBank || 'ABA Bank').trim();
  const isUSD = (params.currency || 'USD') === 'USD';
  const currencyEnum = isUSD ? khqrData.currency.usd : khqrData.currency.khr;
  const expirationMinutes = params.expirationMinutes || 15;
  const expirationTimestamp = Date.now() + expirationMinutes * 60 * 1000;
  const expiresAt = new Date(expirationTimestamp).toISOString();
  const billNumber = params.billNumber || `BP-${Date.now().toString().slice(-6)}`;
  const amount = Number(params.amount || 1.0);

  let qrString = '';
  let md5 = '';

  try {
    const bakongInstance = new BakongKHQR();
    const individual = new IndividualInfo(
      bakongAccountId,
      merchantName,
      merchantCity,
      {
        accountInformation,
        acquiringBank,
        amount,
        currency: currencyEnum,
        billNumber,
        expirationTimestamp,
      }
    );

    const generated = bakongInstance.generateIndividual(individual);
    if (generated && generated.data && generated.data.qr) {
      qrString = generated.data.qr;
      md5 = generated.data.md5 || '';
    } else {
      throw new Error(generated?.status?.message || 'Failed to generate Bakong KHQR');
    }
  } catch (err: any) {
    console.error('BakongKHQR library error, using EMVCo fallback:', err?.message || err);
    // Fallback dynamic EMVCo KHQR format
    const formattedAmt = isUSD ? amount.toFixed(2) : String(Math.round(amount));
    const currCode = isUSD ? '840' : '116';
    const tag29Content = `0016${bakongAccountId}01${accountInformation.length.toString().padStart(2, '0')}${accountInformation}02${acquiringBank.length.toString().padStart(2, '0')}${acquiringBank}`;
    const tag29 = `29${tag29Content.length.toString().padStart(2, '0')}${tag29Content}`;

    let payload = '000201010212'; // 12 = Dynamic
    payload += tag29;
    payload += '52045999';
    payload += `5303${currCode}`;
    payload += `54${formattedAmt.length.toString().padStart(2, '0')}${formattedAmt}`;
    payload += '5802KH';
    payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
    payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`;
    if (billNumber) {
      const billTag = `01${billNumber.length.toString().padStart(2, '0')}${billNumber}`;
      payload += `62${billTag.length.toString().padStart(2, '0')}${billTag}`;
    }
    payload += '6304';
    
    // Simple CRC
    let crc = 0xffff;
    const buf = Buffer.from(payload, 'utf8');
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = ((byte >> (7 - j)) & 1) === 1;
        const c15 = ((crc >> 15) & 1) === 1;
        crc <<= 1;
        if (c15 !== bit) crc ^= 0x1021;
      }
    }
    const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    qrString = payload + crcHex;
  }

  // Generate crisp, clean QR code Data URL
  const qrDataUrl = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 440,
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
    amount,
    currency: isUSD ? 'USD' : 'KHR',
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

