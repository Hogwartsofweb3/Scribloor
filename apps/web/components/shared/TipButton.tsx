'use client';

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import toast from 'react-hot-toast';

interface TipButtonProps {
  publicationId: string;
  postId?: string;
  vaultEntryId?: string;
  creatorName: string;
}

export function TipButton({ publicationId, postId, vaultEntryId, creatorName }: TipButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { authenticated, login } = usePrivy();
  const { publicKey, signTransaction } = useWallet();

  const handleTip = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!publicKey || !signTransaction) {
      toast.error('No wallet connected');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Get Transaction from API
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationId,
          postId,
          vaultEntryId,
          amountUsdc: amount,
          message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to build transaction');
      }

      const { transaction: base64Tx } = await res.json();
      
      // 2. Deserialize and Sign
      const txBuffer = Buffer.from(base64Tx, 'base64');
      const transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));

      const signedTx = await signTransaction(transaction);

      // 3. Send
      const connection = new Connection(process.env.NEXT_PUBLIC_HELIUS_RPC_URL!);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      toast.success('Tip sent! Thank you for supporting the creator.', { id: signature });
      setIsOpen(false);
      setMessage('');
      
    } catch (err: any) {
      console.error('[Tip] Error:', err);
      toast.error(err.message || 'Failed to send tip');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <Heart className="w-4 h-4 mr-1" />
        Tip
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold mb-1">Tip {creatorName}</h3>
            <p className="text-sm text-slate-500 mb-6">100% of your tip goes directly to the creator via USDC.</p>

            <div className="flex gap-3 mb-6">
              {[5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`flex-1 py-2 rounded-xl border-2 font-bold ${
                    amount === amt 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <div className="flex-1 relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full py-2 pl-7 pr-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-0 text-sm resize-none"
                placeholder="Say something nice..."
              ></textarea>
            </div>

            <button
              onClick={handleTip}
              disabled={isProcessing}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Send $${amount} Tip`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
