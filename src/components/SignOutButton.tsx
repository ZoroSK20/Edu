'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function SignOutButton() {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Sign Out
    </Button>
  );
}
