'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function ODActionButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAction(action: 'APPROVE' | 'REJECT') {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/od/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      if (res.ok) {
        router.refresh(); // Refresh the server component to instantly remove the pending request
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => handleAction('REJECT')} 
        disabled={isProcessing} 
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
      >
        {isProcessing ? '...' : 'Reject'}
      </Button>
      <Button 
        onClick={() => handleAction('APPROVE')} 
        disabled={isProcessing} 
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isProcessing ? '...' : 'Approve'}
      </Button>
    </div>
  );
}
