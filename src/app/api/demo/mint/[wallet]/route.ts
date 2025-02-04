import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { env } from '@/env';

// ABI for the mint function
const ABI = [
  "function mint(address to) external"
];

// Polygon Amoy testnet RPC URL
const RPC_URL = "https://rpc-amoy.polygon.technology";

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(env.MINT_PRIVATE_KEY, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(
      env.MINT_CONTRACT_ADDRESS,
      ABI,
      signer
    );

    // Call mint function
    const tx = await contract.mint(wallet);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return NextResponse.json({ 
      success: true,
      hash: receipt.hash
    });
    
  } catch (error) {
    console.error('Error minting:', error);
    return NextResponse.json(
      { error: 'Failed to mint token' },
      { status: 500 }
    );
  }
}
