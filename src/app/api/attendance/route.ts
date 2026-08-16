import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, date, records } = body;

    if (!courseId || !date || !records) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Use a transaction to ensure all records save or none do
    const transactions = records.map((record: { studentId: string, status: string }) => {
      return prisma.attendance.create({
        data: {
          courseId,
          studentId: record.studentId,
          date: new Date(date),
          status: record.status, // e.g., 'PRESENT', 'ABSENT'
        }
      });
    });

    await prisma.$transaction(transactions);

    return NextResponse.json({ success: true, message: 'Attendance recorded successfully.' });
  } catch (error) {
    console.error('Attendance API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
