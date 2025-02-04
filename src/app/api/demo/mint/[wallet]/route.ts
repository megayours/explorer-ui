import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory storage for rate limiting
// Note: This will reset when the serverless function cold starts
const walletLimits = new Map<string, number>();  // wallet -> timestamp
const ipLimits = new Map<string, number>();      // ip -> timestamp

const WALLET_COOLDOWN = 60 * 60 * 1000;  // 1 hour in ms
const IP_COOLDOWN = 10 * 60 * 1000;      // 10 minutes in ms

function canMint(wallet: string, ip: string): { 
  canMint: boolean; 
  walletReset?: number;
  ipReset?: number;
} {
  const now = Date.now();
  const walletLastMint = walletLimits.get(wallet) || 0;
  const ipLastMint = ipLimits.get(ip) || 0;

  const walletTimeLeft = Math.max(0, WALLET_COOLDOWN - (now - walletLastMint));
  const ipTimeLeft = Math.max(0, IP_COOLDOWN - (now - ipLastMint));

  return {
    canMint: walletTimeLeft === 0 && ipTimeLeft === 0,
    walletReset: walletTimeLeft > 0 ? now + walletTimeLeft : undefined,
    ipReset: ipTimeLeft > 0 ? now + ipTimeLeft : undefined,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const wallet = (await params).wallet.toLowerCase();

    const status = canMint(wallet, ip);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking mint status:', error);
    return NextResponse.json(
      { error: 'Failed to check mint status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const wallet = (await params).wallet.toLowerCase();

    const status = canMint(wallet, ip);
    
    if (!status.canMint) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          walletReset: status.walletReset,
          ipReset: status.ipReset,
        },
        { status: 429 }
      );
    }

    // Set the cooldown timers
    const now = Date.now();
    walletLimits.set(wallet, now);
    ipLimits.set(ip, now);

    // For now, just return success since we're only implementing rate limiting
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing mint:', error);
    return NextResponse.json(
      { error: 'Failed to process mint' },
      { status: 500 }
    );
  }
} 