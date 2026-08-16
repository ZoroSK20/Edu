'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function MarkReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkRead() {
    setIsLoading(true);
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId })
    });
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs" 
      onClick={handleMarkRead} 
      disabled={isLoading}
    >
      {isLoading ? '...' : 'Mark Read'}
    </Button>
  );
}
