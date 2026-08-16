import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    const csvHeaders = 'ID,Name,Email,Role,JoinDate\n';
    const csvRows = users.map(u => 
      `${u.id},"${u.name}","${u.email}",${u.role},${u.createdAt.toISOString()}`
    ).join('\n');
    const csvData = csvHeaders + csvRows;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="system-report.csv"',
      },
    });

  } catch (error) {
    console.error('Report Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
