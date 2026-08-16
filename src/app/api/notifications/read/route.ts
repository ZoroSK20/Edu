import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, userId } = body;

    // 1. Mark a specific notification as read
    if (notificationId) {
      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read.',
        data: updatedNotification,
      });
    } 
    // 2. Bulk action: Mark all notifications as read for a specific user
    else if (userId) {
      const batchUpdate = await prisma.notification.updateMany({
        where: { 
          userId: userId,
          read: false 
        },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        message: `${batchUpdate.count} notifications marked as read.`,
        data: batchUpdate,
      });
    } 
    
    // 3. Invalid payload fallback
    else {
      return NextResponse.json(
        { success: false, error: 'Missing required payload: notificationId or userId.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Notification Update API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating notifications.' },
      { status: 500 }
    );
  }
}
