// In-memory Rate Limiting for Login & Security Guards

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
  firstAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(identifier: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // If currently locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMs = record.lockedUntil - now;
    const remainingMins = Math.ceil(remainingMs / 60000);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterMinutes: remainingMins,
    };
  }

  // If window expired, reset
  if (now - record.firstAttempt > WINDOW_DURATION_MS) {
    loginAttempts.delete(identifier);
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { isBlocked: remaining === 0, remainingAttempts: remaining };
}

export function recordFailedLoginAttempt(identifier: string): {
  isNowLocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    loginAttempts.set(identifier, {
      count: 1,
      lockedUntil: null,
      firstAttempt: now,
    });
    return { isNowLocked: false, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // If window expired
  if (now - record.firstAttempt > WINDOW_DURATION_MS) {
    loginAttempts.set(identifier, {
      count: 1,
      lockedUntil: null,
      firstAttempt: now,
    });
    return { isNowLocked: false, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return {
      isNowLocked: true,
      remainingAttempts: 0,
      retryAfterMinutes: 15,
    };
  }

  return {
    isNowLocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

export function clearLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}
